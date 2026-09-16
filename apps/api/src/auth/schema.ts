import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Invalid email address")),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export function parseLoginBody(body: unknown): LoginInput {
  return loginSchema.parse(body);
}
