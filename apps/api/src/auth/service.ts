import { SignJWT } from "jose";
import bcrypt from "bcryptjs";
import { queryOne } from "../db";
import { requireJwtSecret } from "../config";
import { HttpError } from "../errors";
import { parseLoginBody } from "./schema";

const TOKEN_TTL_SECONDS = 3600;
const INVALID_CREDENTIALS = "Invalid email or password";

// Precomputed so unknown-email logins cost the same as wrong-password logins.
const dummyHashPromise = bcrypt.hash("timing-equalizer", 12);

export async function login(body: unknown) {
  const { email, password } = parseLoginBody(body);

  const user = await queryOne<{
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    password_hash: string | null;
  }>(
    "SELECT id, name, username, email, role, password_hash FROM users WHERE email = ? COLLATE NOCASE",
    [email],
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
