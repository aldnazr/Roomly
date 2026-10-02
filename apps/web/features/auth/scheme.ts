import { z } from "zod";

const loginIdentifier = z
  .string()
  .trim()
  .min(1, "Harap masukkan username atau email")
  .refine(
    (v) => {
      const isEmail = z.email().safeParse(v).success;
      const isUsername = /^[a-zA-Z0-9._]{3,}$/.test(v);

      return isEmail || isUsername;
    },
    { message: "Masukkan username atau email yang valid" },
  );

export const loginSchema = z.object({
  identifier: loginIdentifier,
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type LoginFormErrors = Partial<Record<keyof LoginInput, string[]>>;
