import { z } from "zod";

const setPermissionsSchema = z.object({
  permissions: z
    .array(z.string().trim().min(1, "Permission slug must not be empty"))
    .refine((slugs) => new Set(slugs).size === slugs.length, {
      message: "Duplicate permission slugs",
    }),
});

export type SetPermissionsInput = z.infer<typeof setPermissionsSchema>;

export function parseSetPermissionsBody(body: unknown): SetPermissionsInput {
  return setPermissionsSchema.parse(body);
}
