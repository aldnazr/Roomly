import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(3, "Minimal 3 karakter")
  .regex(/^[a-zA-Z0-9._]+$/, "Hanya huruf, angka, titik, atau garis bawah");
const email = z.email("Email tidak valid");
const role = z.string("Role wajib dipilih").min(1, "Role wajib dipilih");

export const userCreateSchema = z.object({
  username,
  email,
  role,
  password: z.string().min(8, "Minimal 8 karakter"),
});

export const userUpdateSchema = z.object({
  username,
  email,
  role,
  password: z
    .string()
    .refine((v) => v === "" || v.length >= 8, "Minimal 8 karakter")
    .transform((v) => v || undefined),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserFormErrors = Partial<Record<keyof UserCreateInput, string[]>>;
