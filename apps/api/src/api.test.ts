import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { AddressInfo } from "net";

const dir = mkdtempSync(join(tmpdir(), "api-test-"));

process.env.DATABASE_PATH = join(dir, "test.db");
process.env.JWT_SECRET = "unit-test-secret-0123456789abcdef";
process.env.ADMIN_NAME = "Admin";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "admin-password-123";

const { default: db, migrate } = await import("./db");
const { seedRoles } = await import("./seeders/roles");
const { seedAdmin } = await import("./seeders/admin");
const { createApp } = await import("./app");
const { requireJwtSecret } = await import("./config");
const { jwtVerify } = await import("jose");
import type { Server } from "node:http";

let server: Server;
let baseUrl: string;

const login = (body: unknown, contentType = "application/json") =>
  fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeAll(async () => {
  await seedAdmin();
  server = createApp().listen(0);
  baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
  db.close();
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // Windows may keep the WAL locked briefly after close
  }
});

describe("migrations", () => {
  test("applies all migrations on a fresh database", () => {
    const applied = db
      .query<{ id: number }, []>("SELECT id FROM schema_migrations")
      .all()
      .map((row) => row.id);
    expect(applied).toEqual([1, 2]);

    const columns = db
      .query<{ name: string }, []>("PRAGMA table_info(users)")
      .all()
      .map((column) => column.name);
    expect(columns).toContain("password_hash");
  });

  test("is idempotent on rerun", () => {
    migrate();
    const count = db
      .query<{ n: number }, []>("SELECT COUNT(*) AS n FROM schema_migrations")
      .get()!.n;
    expect(count).toBe(2);
  });

  test("adds password_hash to a legacy database without it", () => {
    const legacyPath = join(dir, "legacy.db");
    const seed = new Database(legacyPath);
    seed.run(
      `CREATE TABLE roles (
        id INTEGER PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT NOT NULL
      ) STRICT`,
    );
    seed.run(
      `CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        role TEXT NOT NULL DEFAULT 'guest' REFERENCES roles(slug) ON DELETE RESTRICT ON UPDATE CASCADE
      ) STRICT`,
    );
    seed.run("INSERT INTO roles (slug, name, description) VALUES ('guest', 'Guest', 'Guest')");
    seed.run("INSERT INTO users (name, email, role) VALUES ('Old User', 'old@example.com', 'guest')");
    seed.close();

    const legacy = new Database(legacyPath);
    migrate(legacy);

    const columns = legacy
      .query<{ name: string }, []>("PRAGMA table_info(users)")
      .all()
      .map((column) => column.name);
    expect(columns).toContain("password_hash");

    const row = legacy
      .query<{ name: string; password_hash: string | null }, []>(
        "SELECT name, password_hash FROM users WHERE email = 'old@example.com'",
      )
      .get();
    expect(row?.name).toBe("Old User");
    expect(row?.password_hash).toBeNull();

    migrate(legacy);
    legacy.close();
  });
});

describe("admin seeder", () => {
  test("creates exactly one admin with a stored hash, not plaintext", () => {
    const admins = db
      .query<{ id: number; role: string; password_hash: string }, []>(
        "SELECT id, role, password_hash FROM users WHERE email = 'admin@example.com'",
      )
      .all();
    expect(admins.length).toBe(1);
    expect(admins[0]!.role).toBe("admin");
    expect(admins[0]!.password_hash).not.toBe("admin-password-123");
  });

  test("rotates credentials on rerun and stays idempotent", async () => {
    const before = db
      .query<{ password_hash: string }, []>(
        "SELECT password_hash FROM users WHERE email = 'admin@example.com'",
      )
      .get()!.password_hash;

    process.env.ADMIN_PASSWORD = "rotated-password-456";
    await seedAdmin();
    process.env.ADMIN_PASSWORD = "admin-password-123";

    const rows = db
      .query<{ password_hash: string }, []>(
        "SELECT password_hash FROM users WHERE email = 'admin@example.com'",
      )
      .all();
    expect(rows.length).toBe(1);
    expect(rows[0]!.password_hash).not.toBe(before);
    expect(
      await Bun.password.verify("rotated-password-456", rows[0]!.password_hash),
    ).toBeTrue();
  });
});

describe("POST /api/auth/login", () => {
  test("returns 200 with token, expiry, and user DTO on success", async () => {
    const res = await login({
      email: "admin@example.com",
      password: "rotated-password-456",
    });
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      data: {
        accessToken: string;
        expiresIn: number;
        user: { id: number; name: string; email: string; role: string };
      };
    };
    expect(json.data.expiresIn).toBe(3600);
    expect(json.data.user).toEqual({
      id: expect.any(Number),
      name: "Admin",
      email: "admin@example.com",
      role: "admin",
    });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(json.data.accessToken, secret, {
      issuer: "roomly-api",
      audience: "roomly",
    });
    expect(payload.sub).toBe(String(json.data.user.id));
    expect(payload.role).toBe("admin");
    expect(payload.exp! - payload.iat!).toBe(3600);
  });

  test("normalizes email case and whitespace", async () => {
    const res = await login({
      email: "  ADMIN@Example.COM ",
      password: "rotated-password-456",
    });
    expect(res.status).toBe(200);
  });

  test("returns 400 for missing, invalid, or malformed fields", async () => {
    for (const body of [
      {},
      { email: "not-an-email", password: "x" },
      { email: "admin@example.com" },
      { password: "x" },
    ]) {
      const res = await login(body);
      expect(res.status).toBe(400);
    }

    const malformed = await login("{not json", "application/json");
    expect(malformed.status).toBe(400);

    const notObject = await login("just a string");
    expect(notObject.status).toBe(400);
  });

  test("returns identical 401 bodies for unknown email, wrong password, and missing hash", async () => {
    db.run(
      "INSERT INTO users (name, email, role) VALUES ('No Hash', 'nohash@example.com', 'guest')",
    );

    const cases = [
      { email: "ghost@example.com", password: "whatever-123" },
      { email: "admin@example.com", password: "wrong-password" },
      { email: "nohash@example.com", password: "whatever-123" },
    ];

    const responses = await Promise.all(cases.map((body) => login(body)));
    const bodies = await Promise.all(responses.map((res) => res.json()));

    for (const res of responses) expect(res.status).toBe(401);
    expect(bodies[1]).toEqual(bodies[0]);
    expect(bodies[2]).toEqual(bodies[0]);
  });

  test("never leaks password material in responses", async () => {
    const res = await login({
      email: "admin@example.com",
      password: "rotated-password-456",
    });
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("password_hash");
    expect(text.toLowerCase().includes("password")).toBeFalse();
  });
});

describe("configuration", () => {
  const original = process.env.JWT_SECRET!;

  test("rejects a missing or too-short JWT secret", () => {
    delete process.env.JWT_SECRET;
    expect(() => requireJwtSecret()).toThrow(/JWT_SECRET/);

    process.env.JWT_SECRET = "too-short";
    expect(() => requireJwtSecret()).toThrow(/JWT_SECRET/);
  });

  test("accepts a valid secret", () => {
    process.env.JWT_SECRET = original;
    expect(requireJwtSecret()).toBe(original);
  });
});
