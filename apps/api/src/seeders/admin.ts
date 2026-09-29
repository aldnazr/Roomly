import { db } from "../db";
import bcrypt from "bcryptjs";
import { requireAdminEnv } from "../config";
import { seedRoles } from "./roles";

export async function seedAdmin(): Promise<string> {
  const { ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
    requireAdminEnv();

  await seedRoles();

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await db.execute({
    sql: `INSERT INTO users (name, username, email, role, password_hash)
         VALUES (?, ?, ?, 'admin', ?)
         ON CONFLICT(email) DO UPDATE SET
           name = excluded.name,
           username = excluded.username,
           role = 'admin',
           password_hash = excluded.password_hash`,
    args: [ADMIN_NAME, ADMIN_USERNAME, ADMIN_EMAIL, passwordHash],
  });

  return ADMIN_EMAIL;
}

if (import.meta.main) {
  seedAdmin()
    .then((email) => {
      console.log(`Admin seeded/rotated for ${email}`);
    })
    .catch((err) => {
      console.error(err instanceof Error ? err.message : err);
      process.exit(1);
    });
}