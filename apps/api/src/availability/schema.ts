import { z } from "zod";

export const MAX_STAY_NIGHTS = 30;

export const availabilityQuerySchema = z
  .object({
    check_in: z.string().date("Invalid check-in date format (expected YYYY-MM-DD)"),
    check_out: z.string().date("Invalid check-out date format (expected YYYY-MM-DD)"),
    guests: z.coerce
      .number({ error: "Guests must be an integer" })
      .int("Guests must be an integer")
      .min(1, "Guests must be at least 1")
      .max(50, "Guests cannot exceed 50"),
  })
  .superRefine((data, ctx) => {
    if (data.check_out <= data.check_in) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out"],
        message: "check_out must be strictly after check_in",
      });
      return;
    }

    const start = new Date(`${data.check_in}T00:00:00Z`).getTime();
    const end = new Date(`${data.check_out}T00:00:00Z`).getTime();
    const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));

    if (nights > MAX_STAY_NIGHTS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["check_out"],
        message: `Stay duration exceeds maximum of ${MAX_STAY_NIGHTS} nights`,
      });
    }
  });

export type AvailabilityQueryInput = z.infer<typeof availabilityQuerySchema>;

export function parseAvailabilityQuery(query: unknown): AvailabilityQueryInput {
  return availabilityQuerySchema.parse(query);
}
