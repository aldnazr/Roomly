import { z } from "zod";

const jwtSecretSchema = z
  .string()
  .min(32, "JWT_SECRET must be at least 32 characters");

export function requireJwtSecret(): string {
  const parsed = jwtSecretSchema.safeParse(process.env.JWT_SECRET);
  if (!parsed.success) {
    throw new Error(
      "Invalid configuration: JWT_SECRET must be set and at least 32 characters",
    );
  }
  return parsed.data;
}

const adminEnvSchema = z.object({
  ADMIN_NAME: z.string().min(1),
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(8),
});

export function requireAdminEnv() {
  const parsed = adminEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      "Invalid configuration: ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD (min 8 chars) must be set",
    );
  }
  return parsed.data;
}
