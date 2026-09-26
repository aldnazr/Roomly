import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be at most 50 characters")
  .regex(/^[a-zA-Z0-9._-]+$/, "Username can only contain alphanumeric characters, dots, underscores, and hyphens");

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Invalid email address"));

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

const roleSchema = z
  .string()
  .trim()
  .min(1, "Role is required");

export const createUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

export const updateUserSchema = z
  .object({
    username: usernameSchema.optional(),
    email: emailSchema.optional(),
    password: passwordSchema.optional(),
    role: roleSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    { message: "At least one field must be provided for update" },
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export function parseCreateUserBody(body: unknown): CreateUserInput {
  return createUserSchema.parse(body);
}

export function parseUpdateUserBody(body: unknown): UpdateUserInput {
  return updateUserSchema.parse(body);
}
