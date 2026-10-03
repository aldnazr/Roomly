import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { type InValue } from "@libsql/client";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { AddressInfo } from "net";
import bcrypt from "bcryptjs";

const dir = mkdtempSync(join(tmpdir(), "api-test-"));

// ponytail: file: URL stays local so tests never hit the network.
process.env.TURSO_DATABASE_URL = `file:${join(dir, "test.db").split("\\").join("/")}`;
process.env.JWT_SECRET = "unit-test-secret-0123456789abcdef";
process.env.ADMIN_NAME = "Admin";
process.env.ADMIN_USERNAME = "admin";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = "admin-password-123";

const { db, migrate, query, queryOne } = await import("./db");
const { seedRoles } = await import("./seeders/roles");
const { seedAdmin } = await import("./seeders/admin");
const { createApp } = await import("./app");
const { requireJwtSecret } = await import("./config");
const { jwtVerify } = await import("jose");
import type { Server } from "node:http";

const insertReturningId = async (sql: string, args: InValue[] = []): Promise<number> => {
  const result = await db.execute({ sql, args });
  return result.rows[0]!.id as number;
};

let server: Server;
let baseUrl: string;

const login = (body: unknown, contentType = "application/json") =>
  fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

beforeAll(async () => {
  await migrate();
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
  test("applies all migrations on a fresh database", async () => {
    const applied = (
      await query<{ id: number }>("SELECT id FROM schema_migrations ORDER BY id ASC")
    ).map((row) => row.id);
    expect(applied).toEqual([1, 2, 3, 4, 5]);

    const columns = (
      await query<{ name: string }>("PRAGMA table_info(users)")
    ).map((column) => column.name);
    expect(columns).toContain("password_hash");
    expect(columns).toContain("username");

    const roomTypeCols = (
      await query<{ name: string }>("PRAGMA table_info(room_types)")
    ).map((column) => column.name);
    expect(roomTypeCols).toContain("amenities");
    expect(roomTypeCols).toContain("photos");
  });

  test("is idempotent on rerun", async () => {
    await migrate();
    const count = (
      await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM schema_migrations")
    )!.n;
    expect(count).toBe(5);
  });
});

describe("admin seeder", () => {
  test("creates exactly one admin with a stored hash, not plaintext", async () => {
    const admins = await query<{ id: number; role: string; password_hash: string }>(
      "SELECT id, role, password_hash FROM users WHERE email = 'admin@example.com'",
    );
    expect(admins.length).toBe(1);
    expect(admins[0]!.role).toBe("admin");
    expect(admins[0]!.password_hash).not.toBe("admin-password-123");
  });

  test("rotates credentials on rerun and stays idempotent", async () => {
    const before = (
      await queryOne<{ password_hash: string }>(
        "SELECT password_hash FROM users WHERE email = 'admin@example.com'",
      )
    )!.password_hash;

    process.env.ADMIN_PASSWORD = "rotated-password-456";
    await seedAdmin();
    process.env.ADMIN_PASSWORD = "admin-password-123";

    const rows = await query<{ password_hash: string }>(
      "SELECT password_hash FROM users WHERE email = 'admin@example.com'",
    );
    expect(rows.length).toBe(1);
    expect(rows[0]!.password_hash).not.toBe(before);
    expect(await bcrypt.compare("rotated-password-456", rows[0]!.password_hash)).toBeTrue();
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
        user: {
          id: number;
          username: string;
          name: string;
          email: string;
          role: string;
        };
      };
    };
    expect(json.data.expiresIn).toBe(3600);
    expect(json.data.user).toEqual({
      id: expect.any(Number),
      username: "admin",
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

  test("logs in with username as identifier", async () => {
    const res = await login({ username: "admin", password: "rotated-password-456" });
    expect(res.status).toBe(200);

    const { data } = (await res.json()) as { data: { user: { email: string } } };
    expect(data.user.email).toBe("admin@example.com");
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
    await db.execute(
      "INSERT INTO users (name, email, role) VALUES ('No Hash', 'nohash@example.com', 'staff')",
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

describe("permissions API", () => {
  const url = () => `${baseUrl}/api/permissions`;
  const get = (token?: string) =>
    fetch(url(), token ? { headers: { Authorization: `Bearer ${token}` } } : {});

  let guestToken: string;

  beforeAll(async () => {
    const res = await login({ email: "admin@example.com", password: "rotated-password-456" });
    guestToken = ((await res.json()) as { data: { accessToken: string } }).data.accessToken;
  });

  test("returns 401 without or with an invalid token", async () => {
    expect((await get()).status).toBe(401);
    expect((await get("not-a-jwt")).status).toBe(401);
  });

  test("lists every seeded permission in seed order for any authenticated user", async () => {
    const res = await get(guestToken);
    expect(res.status).toBe(200);

    const { data } = (await res.json()) as {
      data: { slug: string; name: string; description: string }[];
    };
    expect(data.map((permission) => permission.slug)).toEqual([
      "rooms.browse",
      "bookings.create",
      "bookings.view_own",
      "bookings.cancel_own",
      "bookings.view_all",
      "bookings.check_in",
      "bookings.check_out",
      "rooms.update_status",
      "room_types.manage",
      "pricing.manage",
      "reports.occupancy.view",
      "reports.revenue.view",
      "refunds.approve",
      "staff.manage",
      "permissions.manage",
      "users.manage",
    ]);
    expect(data[0]!.name).toBe("Browse rooms");
    expect(typeof data[0]!.description).toBe("string");
  });
});

describe("GET /api/auth/me", () => {
  const meUrl = () => `${baseUrl}/api/auth/me`;
  const get = (token?: string) =>
    fetch(meUrl(), token ? { headers: { Authorization: `Bearer ${token}` } } : {});

  let adminToken: string;

  beforeAll(async () => {
    const res = await login({ email: "admin@example.com", password: "rotated-password-456" });
    adminToken = ((await res.json()) as { data: { accessToken: string } }).data.accessToken;
  });

  test("returns 401 without token or with malformed token", async () => {
    expect((await get()).status).toBe(401);
    expect((await get("invalid-token")).status).toBe(401);
  });

  test("returns current user info with complete role and permissions", async () => {
    const res = await get(adminToken);
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      data: {
        id: number;
        username: string | null;
        name: string;
        email: string;
        role: {
          slug: string;
          name: string;
          description: string;
        };
        permissions: string[];
      };
    };

    expect(json.data.username).toBe("admin");
    expect(json.data.email).toBe("admin@example.com");
    expect(json.data.role).toEqual({
      slug: "admin",
      name: "Admin",
      description: "Administrator dengan akses penuh ke seluruh fitur aplikasi.",
    });
    expect(json.data.permissions).toContain("permissions.manage");
    expect(json.data.permissions).toContain("users.manage");
    expect(JSON.stringify(json.data)).not.toContain("password");
  });
});

describe("roles API", () => {
  const rolesUrl = (path = "") => `${baseUrl}/api/roles${path}`;
  const get = (path: string, token: string) =>
    fetch(rolesUrl(path), { headers: { Authorization: `Bearer ${token}` } });
  const put = (path: string, body: unknown, token: string) =>
    fetch(rolesUrl(path), {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  const viewPermissions = async (path: string, token: string) => {
    const res = await get(path, token);
    expect(res.status).toBe(200);
    return ((await res.json()) as { data: { permissions: string[] } }).data.permissions;
  };

  let adminToken: string;
  let guestToken: string;

  beforeAll(async () => {
    const admin = await login({ email: "admin@example.com", password: "rotated-password-456" });
    adminToken = ((await admin.json()) as { data: { accessToken: string } }).data.accessToken;

    await db.execute({
      sql: "INSERT INTO users (name, email, role, password_hash) VALUES ('Staff', 'guest@example.com', 'staff', ?)",
      args: [await bcrypt.hash("guest-password-123", 12)],
    });
    const guest = await login({ email: "guest@example.com", password: "guest-password-123" });
    guestToken = ((await guest.json()) as { data: { accessToken: string } }).data.accessToken;
  });

  // ponytail: restore seeded permissions after tests that replace staff's set.
  afterAll(async () => {
    await seedRoles();
  });

  test("returns 401 without or with an invalid token", async () => {
    expect((await fetch(rolesUrl())).status).toBe(401);
    expect((await get("/staff", "not-a-jwt")).status).toBe(401);
  });

  test("lists every seeded role with its permissions for any authenticated user", async () => {
    const res = await get("/", guestToken);
    expect(res.status).toBe(200);

    const { data } = (await res.json()) as {
      data: { slug: string; name: string; description: string; permissions: string[] }[];
    };
    expect(data.map((role) => role.slug)).toEqual(["staff", "admin"]);
    expect(data[0]!.permissions).toEqual([
      "rooms.browse",
      "bookings.create",
      "bookings.view_own",
      "bookings.cancel_own",
      "bookings.view_all",
      "bookings.check_in",
      "bookings.check_out",
      "rooms.update_status",
    ]);
    const admin = data.find((role) => role.slug === "admin")!;
    expect(admin.permissions).toContain("permissions.manage");
  });

  test("returns one role and 404 for an unknown slug", async () => {
    const res = await get("/staff", guestToken);
    expect(res.status).toBe(200);

    const { data } = (await res.json()) as { data: { slug: string; description: string } };
    expect(data.slug).toBe("staff");
    expect(typeof data.description).toBe("string");

    expect((await get("/missing", guestToken)).status).toBe(404);
  });

  test("returns 403 when the caller lacks permissions.manage", async () => {
    const res = await put("/staff/permissions", { permissions: [] }, guestToken);
    expect(res.status).toBe(403);
  });

  test("replaces the permission set and persists it", async () => {
    const res = await put(
      "/staff/permissions",
      { permissions: ["rooms.browse", "bookings.view_all"] },
      adminToken,
    );
    expect(res.status).toBe(200);

    const { data } = (await res.json()) as { data: { slug: string; permissions: string[] } };
    expect(data.slug).toBe("staff");
    expect(data.permissions).toEqual(["rooms.browse", "bookings.view_all"]);
    expect(await viewPermissions("/staff", adminToken)).toEqual([
      "rooms.browse",
      "bookings.view_all",
    ]);
  });

  test("rejects unknown permission slugs without writing", async () => {
    const res = await put(
      "/staff/permissions",
      { permissions: ["rooms.browse", "bogus.slug"] },
      adminToken,
    );
    expect(res.status).toBe(400);
    expect(await viewPermissions("/staff", adminToken)).toEqual([
      "rooms.browse",
      "bookings.view_all",
    ]);
  });

  test("returns 404 for an unknown role and 400 for invalid bodies", async () => {
    expect((await put("/missing/permissions", { permissions: [] }, adminToken)).status).toBe(404);
    expect(
      (await put("/staff/permissions", { permissions: ["rooms.browse", "rooms.browse"] }, adminToken))
        .status,
    ).toBe(400);
    expect((await put("/staff/permissions", { permissions: "rooms.browse" }, adminToken)).status).toBe(400);
    expect((await put("/staff/permissions", {}, adminToken)).status).toBe(400);
  });

  test("accepts an empty permission set", async () => {
    const res = await put("/staff/permissions", { permissions: [] }, adminToken);
    expect(res.status).toBe(200);
    expect(await viewPermissions("/staff", adminToken)).toEqual([]);
  });
});

describe("users API", () => {
  const usersUrl = (path = "") => `${baseUrl}/api/users${path}`;
  const get = (path: string, token?: string) =>
    fetch(usersUrl(path), token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const post = (path: string, body: unknown, token?: string) =>
    fetch(usersUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  const patch = (path: string, body: unknown, token?: string) =>
    fetch(usersUrl(path), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  const del = (path: string, token?: string) =>
    fetch(usersUrl(path), {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  let adminToken: string;
  let guestToken: string;

  beforeAll(async () => {
    const admin = await login({ email: "admin@example.com", password: "rotated-password-456" });
    adminToken = ((await admin.json()) as { data: { accessToken: string } }).data.accessToken;

    const guest = await login({ email: "guest@example.com", password: "guest-password-123" });
    guestToken = ((await guest.json()) as { data: { accessToken: string } }).data.accessToken;
  });

  test("returns 401 without or with an invalid token", async () => {
    expect((await get("")).status).toBe(401);
    expect((await get("", "not-a-jwt")).status).toBe(401);
    expect((await post("", {}, "not-a-jwt")).status).toBe(401);
  });

  test("returns 403 when the caller lacks users.manage", async () => {
    expect((await get("", guestToken)).status).toBe(403);
    expect((await get("/1", guestToken)).status).toBe(403);
    expect((await post("", {}, guestToken)).status).toBe(403);
    expect((await patch("/1", {}, guestToken)).status).toBe(403);
    expect((await del("/1", guestToken)).status).toBe(403);
  });

  test("creates a new user and allows login with credentials", async () => {
    const payload = {
      username: "staff_john",
      email: "john@example.com",
      password: "secure-password-123",
      role: "staff",
    };

    const res = await post("", payload, adminToken);
    expect(res.status).toBe(201);

    const json = (await res.json()) as {
      data: { id: number; username: string; email: string; role: string };
    };
    expect(json.data.username).toBe("staff_john");
    expect(json.data.email).toBe("john@example.com");
    expect(json.data.role).toBe("staff");

    const text = JSON.stringify(json);
    expect(text).not.toContain("password_hash");
    expect(text.toLowerCase().includes("password")).toBeFalse();

    const authRes = await login({ email: "john@example.com", password: "secure-password-123" });
    expect(authRes.status).toBe(200);
  });

  test("validates input and rejects duplicate email/username", async () => {
    const shortPass = await post(
      "",
      { username: "short_p", email: "short@example.com", password: "123", role: "staff" },
      adminToken,
    );
    expect(shortPass.status).toBe(400);

    const badEmail = await post(
      "",
      { username: "bad_e", email: "not-an-email", password: "valid-pass-123", role: "staff" },
      adminToken,
    );
    expect(badEmail.status).toBe(400);

    const bogusRole = await post(
      "",
      { username: "bogus_r", email: "bogus@example.com", password: "valid-pass-123", role: "superhero" },
      adminToken,
    );
    expect(bogusRole.status).toBe(400);

    const dupEmail = await post(
      "",
      { username: "john_clone", email: "john@example.com", password: "valid-pass-123", role: "staff" },
      adminToken,
    );
    expect(dupEmail.status).toBe(409);

    const dupUser = await post(
      "",
      { username: "staff_john", email: "john2@example.com", password: "valid-pass-123", role: "staff" },
      adminToken,
    );
    expect(dupUser.status).toBe(409);
  });

  test("lists all users without exposing password hashes", async () => {
    const res = await get("", adminToken);
    expect(res.status).toBe(200);

    const json = (await res.json()) as { data: { id: number; email: string }[] };
    expect(Array.isArray(json.data)).toBeTrue();
    expect(json.data.length).toBeGreaterThanOrEqual(2);

    const text = JSON.stringify(json);
    expect(text).not.toContain("password_hash");
  });

  test("retrieves a single user by id and returns 404 for unknown id", async () => {
    const listRes = await get("", adminToken);
    const listJson = (await listRes.json()) as { data: { id: number; username: string }[] };
    const first = listJson.data[0]!;

    const res = await get(`/${first.id}`, adminToken);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { id: number } };
    expect(json.data.id).toBe(first.id);

    expect((await get("/99999", adminToken)).status).toBe(404);
    expect((await get("/not-a-number", adminToken)).status).toBe(400);
  });

  test("updates an existing user and reflects changes", async () => {
    const created = await post(
      "",
      { username: "to_update", email: "update@example.com", password: "initial-password-123", role: "admin" },
      adminToken,
    );
    const { id } = ((await created.json()) as { data: { id: number } }).data;

    const patchRes = await patch(
      `/${id}`,
      { email: "updated@example.com", role: "staff" },
      adminToken,
    );
    expect(patchRes.status).toBe(200);
    const patchedJson = (await patchRes.json()) as { data: { email: string; role: string } };
    expect(patchedJson.data.email).toBe("updated@example.com");
    expect(patchedJson.data.role).toBe("staff");

    const passPatch = await patch(
      `/${id}`,
      { password: "new-secret-password-123" },
      adminToken,
    );
    expect(passPatch.status).toBe(200);

    expect(
      (await login({ email: "updated@example.com", password: "initial-password-123" })).status,
    ).toBe(401);

    expect(
      (await login({ email: "updated@example.com", password: "new-secret-password-123" })).status,
    ).toBe(200);

    const conflictPatch = await patch(
      `/${id}`,
      { email: "john@example.com" },
      adminToken,
    );
    expect(conflictPatch.status).toBe(409);
  });

  test("deletes a user and confirms 404 afterwards", async () => {
    const created = await post(
      "",
      { username: "to_delete", email: "delete_me@example.com", password: "temp-password-123", role: "staff" },
      adminToken,
    );
    const { id } = ((await created.json()) as { data: { id: number } }).data;

    const delRes = await del(`/${id}`, adminToken);
    expect(delRes.status).toBe(200);

    expect((await get(`/${id}`, adminToken)).status).toBe(404);
    expect((await del(`/${id}`, adminToken)).status).toBe(404);
  });
});

describe("room-types API", () => {
  const roomTypesUrl = (path: string) => `${baseUrl}/api/room-types${path}`;
  const get = (path: string, token?: string) =>
    fetch(roomTypesUrl(path), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  const post = (path: string, body: unknown, token?: string) =>
    fetch(roomTypesUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  const patch = (path: string, body: unknown, token?: string) =>
    fetch(roomTypesUrl(path), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  const del = (path: string, token?: string) =>
    fetch(roomTypesUrl(path), {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  let adminToken: string;
  let guestToken: string;

  beforeAll(async () => {
    const admin = await login({ email: "admin@example.com", password: "rotated-password-456" });
    adminToken = ((await admin.json()) as { data: { accessToken: string } }).data.accessToken;

    const guest = await login({ email: "guest@example.com", password: "guest-password-123" });
    guestToken = ((await guest.json()) as { data: { accessToken: string } }).data.accessToken;
  });

  test("returns 401 without or with an invalid token", async () => {
    expect((await get("")).status).toBe(401);
    expect((await get("", "bad-token")).status).toBe(401);
    expect((await post("", {}, "bad-token")).status).toBe(401);
  });

  test("returns 403 on mutation endpoints for staff role", async () => {
    expect((await post("", { name: "Deluxe", capacity: 2, base_price: 500000 }, guestToken)).status).toBe(403);
    expect((await patch("/1", { base_price: 600000 }, guestToken)).status).toBe(403);
    expect((await del("/1", guestToken)).status).toBe(403);
  });

  test("creates a room type and validates fields", async () => {
    const payload = {
      name: "Standard King",
      capacity: 2,
      base_price: 450000,
      description: "King bed room",
      amenities: ["WiFi", "AC"],
      photos: ["https://example.com/king.jpg"],
    };

    const res = await post("", payload, adminToken);
    expect(res.status).toBe(201);
    const json = (await res.json()) as { data: { id: number; name: string; amenities: string[]; photos: string[] } };
    expect(json.data.id).toBeGreaterThan(0);
    expect(json.data.name).toBe("Standard King");
    expect(json.data.amenities).toEqual(["WiFi", "AC"]);
    expect(json.data.photos).toEqual(["https://example.com/king.jpg"]);

    expect((await post("", payload, adminToken)).status).toBe(409);
    expect((await post("", { name: "", capacity: 0, base_price: -100 }, adminToken)).status).toBe(400);
    expect((await post("", { name: "Single", capacity: 1, base_price: 250000, photos: ["bad"] }, adminToken)).status).toBe(400);
  });

  test("lists room types and applies filters", async () => {
    await post("", { name: "Family Suite", capacity: 5, base_price: 1200000 }, adminToken);

    const allRes = await get("", guestToken);
    expect(allRes.status).toBe(200);
    const all = ((await allRes.json()) as { data: { name: string; capacity: number }[] }).data;
    expect(all.length).toBeGreaterThanOrEqual(2);

    const filtered = await get("?capacity_min=4", guestToken);
    expect(filtered.status).toBe(200);
    const filteredList = ((await filtered.json()) as { data: { name: string; capacity: number }[] }).data;
    expect(filteredList.every((rt) => rt.capacity >= 4)).toBeTrue();
  });

  test("retrieves a single room type and returns 404 for unknown", async () => {
    const list = ((await (await get("", guestToken)).json()) as { data: { id: number }[] }).data;
    const first = list[0]!;

    const res = await get(`/${first.id}`, guestToken);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { id: number } };
    expect(json.data.id).toBe(first.id);

    expect((await get("/99999", guestToken)).status).toBe(404);
    expect((await get("/not-number", guestToken)).status).toBe(400);
  });

  test("updates a room type with PATCH", async () => {
    const created = await post("", { name: "To Update", capacity: 2, base_price: 300000 }, adminToken);
    const { id } = ((await created.json()) as { data: { id: number } }).data;

    const res = await patch(`/${id}`, { base_price: 350000, amenities: ["Coffee"] }, adminToken);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { base_price: number; amenities: string[] } };
    expect(json.data.base_price).toBe(350000);
    expect(json.data.amenities).toEqual(["Coffee"]);

    expect((await patch(`/${id}`, {}, adminToken)).status).toBe(400);
  });

  test("deletes room type and guards against FK reference deletion", async () => {
    const created = await post("", { name: "Guarded Suite", capacity: 2, base_price: 600000 }, adminToken);
    const { id } = ((await created.json()) as { data: { id: number } }).data;

    await db.execute({
      sql: "INSERT INTO rooms (room_type_id, room_number, status) VALUES (?, 'G-101', 'available')",
      args: [id],
    });

    const delGuarded = await del(`/${id}`, adminToken);
    expect(delGuarded.status).toBe(409);

    await db.execute("DELETE FROM rooms WHERE room_number = 'G-101'");

    const delSuccess = await del(`/${id}`, adminToken);
    expect(delSuccess.status).toBe(200);
    expect((await get(`/${id}`, guestToken)).status).toBe(404);
  });
});


describe("availability API", () => {
  const availUrl = (qs: string) => `${baseUrl}/api/availability${qs}`;
  const get = (qs: string, token?: string) =>
    fetch(availUrl(qs), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  let guestToken: string;
  let roomTypeId: number;
  let room1Id: number;
  let room2Id: number;
  let guestId: number;

  beforeAll(async () => {
    const guest = await login({ email: "guest@example.com", password: "guest-password-123" });
    guestToken = ((await guest.json()) as { data: { accessToken: string } }).data.accessToken;

    roomTypeId = await insertReturningId(
      "INSERT INTO room_types (name, base_price, capacity, description, amenities, photos) VALUES ('Avail Suite', 500000, 2, 'Test', '[]', '[]') RETURNING id",
    );

    room1Id = await insertReturningId(
      "INSERT INTO rooms (room_type_id, room_number, status) VALUES (?, 'AV-101', 'available') RETURNING id",
      [roomTypeId],
    );

    room2Id = await insertReturningId(
      "INSERT INTO rooms (room_type_id, room_number, status) VALUES (?, 'AV-102', 'available') RETURNING id",
      [roomTypeId],
    );

    await db.execute({
      sql: "INSERT INTO rooms (room_type_id, room_number, status) VALUES (?, 'AV-103', 'maintenance')",
      args: [roomTypeId],
    });

    guestId = await insertReturningId(
      "INSERT INTO guests (name, email, phone) VALUES ('Avail Guest', 'guest@avail.test', '12345') RETURNING id",
    );
  });

  test("validates query parameters", async () => {
    expect((await get("", guestToken)).status).toBe(400);
    expect((await get("?check_in=2026-11-05&check_out=2026-11-01&guests=2", guestToken)).status).toBe(400);
    expect((await get("?check_in=2026-11-01&check_out=2026-11-01&guests=2", guestToken)).status).toBe(400);
    expect((await get("?check_in=2026-11-01&check_out=2026-11-02&guests=0", guestToken)).status).toBe(400);
    expect((await get("?check_in=not-date&check_out=2026-11-02&guests=1", guestToken)).status).toBe(400);
    expect((await get("?check_in=2026-11-01&check_out=2026-12-05&guests=2", guestToken)).status).toBe(400);
  });

  test("calculates operable rooms and pricing breakdown accurately", async () => {
    const res = await get("?check_in=2026-11-10&check_out=2026-11-12&guests=2", guestToken);
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      data: {
        nights: number;
        guests: number;
        results: {
          room_type: { id: number };
          available_rooms: number;
          price: {
            nightly: { date: string; price: number }[];
            total: number;
            average_nightly: number;
          };
        }[];
      };
    };

    expect(json.data.nights).toBe(2);
    const target = json.data.results.find((r) => r.room_type.id === roomTypeId);
    expect(target).toBeDefined();
    expect(target!.available_rooms).toBe(2);
    expect(target!.price.nightly).toEqual([
      { date: "2026-11-10", price: 500000 },
      { date: "2026-11-11", price: 500000 },
    ]);
    expect(target!.price.total).toBe(1000000);
  });

  test("filters out room types where capacity is less than requested guests", async () => {
    const res = await get("?check_in=2026-11-10&check_out=2026-11-12&guests=3", guestToken);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { results: { room_type: { id: number } }[] } };
    expect(json.data.results.some((r) => r.room_type.id === roomTypeId)).toBeFalse();
  });

  test("applies pricing rules with override and multiplier", async () => {
    await db.execute({
      sql: "INSERT INTO pricing_rules (room_type_id, start_date, end_date, multiplier) VALUES (?, '2026-11-15', '2026-11-15', 1.2)",
      args: [roomTypeId],
    });

    await db.execute({
      sql: "INSERT INTO pricing_rules (room_type_id, start_date, end_date, price_override) VALUES (?, '2026-11-16', '2026-11-16', 750000)",
      args: [roomTypeId],
    });

    const res = await get("?check_in=2026-11-15&check_out=2026-11-17&guests=2", guestToken);
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      data: {
        results: {
          room_type: { id: number };
          price: {
            nightly: { date: string; price: number }[];
            total: number;
          };
        }[];
      };
    };

    const target = json.data.results.find((r) => r.room_type.id === roomTypeId)!;
    expect(target.price.nightly).toEqual([
      { date: "2026-11-15", price: 600000 },
      { date: "2026-11-16", price: 750000 },
    ]);
    expect(target.price.total).toBe(1350000);
  });

  test("decrements availability with reservations and unblocks on checkout day", async () => {
    await db.execute({
      sql: `INSERT INTO reservations (guest_id, room_type_id, room_id, check_in, check_out, status, total_price)
       VALUES (?, ?, ?, '2026-11-20', '2026-11-22', 'confirmed', 1000000)`,
      args: [guestId, roomTypeId, room1Id],
    });

    const overlapping = await get("?check_in=2026-11-20&check_out=2026-11-22&guests=2", guestToken);
    const overJson = (await overlapping.json()) as {
      data: { results: { room_type: { id: number }; available_rooms: number }[] };
    };
    const overTarget = overJson.data.results.find((r) => r.room_type.id === roomTypeId)!;
    expect(overTarget.available_rooms).toBe(1);

    const coSearch = await get("?check_in=2026-11-22&check_out=2026-11-24&guests=2", guestToken);
    const coJson = (await coSearch.json()) as {
      data: { results: { room_type: { id: number }; available_rooms: number }[] };
    };
    const coTarget = coJson.data.results.find((r) => r.room_type.id === roomTypeId)!;
    expect(coTarget.available_rooms).toBe(2);

    await db.execute({
      sql: `INSERT INTO reservations (guest_id, room_type_id, room_id, check_in, check_out, status, total_price)
       VALUES (?, ?, ?, '2026-11-20', '2026-11-22', 'confirmed', 1000000)`,
      args: [guestId, roomTypeId, room2Id],
    });

    const fullHouse = await get("?check_in=2026-11-20&check_out=2026-11-22&guests=2", guestToken);
    const fullJson = (await fullHouse.json()) as {
      data: { results: { room_type: { id: number } }[] };
    };
    expect(fullJson.data.results.some((r) => r.room_type.id === roomTypeId)).toBeFalse();
  });
});

