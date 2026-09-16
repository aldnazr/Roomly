import { SignJWT } from "jose";
import db from "../db";
import { requireJwtSecret } from "../config";
import { HttpError } from "../errors";
import { parseLoginBody } from "./schema";

const TOKEN_TTL_SECONDS = 3600;
const INVALID_CREDENTIALS = "Invalid email or password";

// Precomputed so unknown-email logins cost the same as wrong-password logins.
const dummyHashPromise = Bun.password.hash("timing-equalizer");

export async function login(body: unknown) {
  const { email, password } = parseLoginBody(body);

  const user = db
    .query<
      {
        id: number;
        name: string;
        email: string;
        role: string;
        password_hash: string | null;
      },
      [string]
    >(
      "SELECT id, name, email, role, password_hash FROM users WHERE email = ? COLLATE NOCASE",
    )
    .get(email);

  if (!user || !user.password_hash) {
    await Bun.password.verify(password, await dummyHashPromise);
    throw new HttpError(401, INVALID_CREDENTIALS);
  }

  const valid = await Bun.password.verify(password, user.password_hash);
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
        email: user.email,
        role: user.role,
      },
    },
  };
}
