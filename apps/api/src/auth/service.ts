import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { query, queryOne } from "../db";
import { requireJwtSecret } from "../config";
import { HttpError } from "../errors";
import { parseLoginBody } from "./schema";

const TOKEN_TTL_SECONDS = 3600;
const INVALID_CREDENTIALS = "Invalid email or password";

// Precomputed so unknown-email logins cost the same as wrong-password logins.
const dummyHashPromise = bcrypt.hash("timing-equalizer", 12);

export type MeDto = {
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

type CurrentUserRow = {
  id: number;
  username: string | null;
  name: string;
  email: string;
  role_slug: string;
  role_name: string;
  role_description: string;
};

export async function login(body: unknown) {
  const parsed = parseLoginBody(body);
  const { password } = parsed;
  // Single identifier: an email body matches the email column, a username body
  // still matches the email column too, so an email typed into a username
  // field keeps working.
  const identifier = ("email" in parsed ? parsed.email : parsed.username) ?? "";

  const user = await queryOne<{
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    password_hash: string | null;
  }>(
    "SELECT id, name, username, email, role, password_hash FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE",
    [identifier, identifier],
  );

  if (!user || !user.password_hash) {
    await bcrypt.compare(password, await dummyHashPromise);
    throw new HttpError(401, INVALID_CREDENTIALS);
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new HttpError(401, INVALID_CREDENTIALS);

  const secret = new TextEncoder().encode(requireJwtSecret());
  const accessToken = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setIssuer("roomly-api")
    .setAudience("roomly")
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(secret);

  return {
    data: {
      accessToken,
      expiresIn: TOKEN_TTL_SECONDS,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  };
}

export async function getMe(userId: number): Promise<MeDto> {
  const user = await queryOne<CurrentUserRow>(
    `SELECT
       u.id,
       u.username,
       u.name,
       u.email,
       r.slug AS role_slug,
       r.name AS role_name,
       r.description AS role_description
     FROM users u
     JOIN roles r ON r.slug = u.role
     WHERE u.id = ?`,
    [userId],
  );

  if (!user) {
    throw new HttpError(401, "Invalid or expired access token");
  }

  const permissions = (
    await query<{ slug: string }>(
      `SELECT p.slug
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       JOIN roles r ON r.id = rp.role_id
       WHERE r.slug = ?
       ORDER BY p.id`,
      [user.role_slug],
    )
  ).map((permission) => permission.slug);

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: {
      slug: user.role_slug,
      name: user.role_name,
      description: user.role_description,
    },
    permissions,
  };
}
