import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

const capacitySchema = z
  .number({ error: "Capacity must be an integer" })
  .int("Capacity must be an integer")
  .min(1, "Capacity must be at least 1")
  .max(20, "Capacity must be at most 20");

const basePriceSchema = z
  .number({ error: "Base price must be an integer" })
  .int("Base price must be an integer")
  .min(0, "Base price cannot be negative")
  .max(100_000_000, "Base price is too high");

const rawDescriptionSchema = z
  .string()
  .trim()
  .max(1000, "Description must be at most 1000 characters")
  .nullable();

const descriptionSchema = rawDescriptionSchema
  .optional()
  .transform((val) => (val === undefined ? undefined : val && val.length > 0 ? val : null));

const amenitiesSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Amenity name cannot be empty")
      .max(50, "Amenity name must be at most 50 characters"),
  )
  .max(20, "Cannot exceed 20 amenities");

const photosSchema = z
  .array(z.string().trim().url("Photo must be a valid URL"))
  .max(10, "Cannot exceed 10 photos");

export const createRoomTypeSchema = z.object({
  name: nameSchema,
  capacity: capacitySchema,
  base_price: basePriceSchema,
  description: descriptionSchema,
  amenities: amenitiesSchema.default([]),
  photos: photosSchema.default([]),
});

export const updateRoomTypeSchema = z
  .object({
    name: nameSchema.optional(),
    capacity: capacitySchema.optional(),
    base_price: basePriceSchema.optional(),
    description: descriptionSchema,
    amenities: amenitiesSchema.optional(),
    photos: photosSchema.optional(),
  })
  .refine(
    (data) => Object.values(data).some((val) => val !== undefined),
    { message: "At least one field must be provided for update" },
  );

export const queryRoomTypeSchema = z.object({
  capacity_min: z.coerce.number().int().min(1).optional(),
  capacity_max: z.coerce.number().int().min(1).optional(),
});

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;
export type QueryRoomTypeInput = z.infer<typeof queryRoomTypeSchema>;

export function parseCreateRoomTypeBody(body: unknown): CreateRoomTypeInput {
  return createRoomTypeSchema.parse(body);
}

export function parseUpdateRoomTypeBody(body: unknown): UpdateRoomTypeInput {
  return updateRoomTypeSchema.parse(body);
}

export function parseQueryRoomType(query: unknown): QueryRoomTypeInput {
  return queryRoomTypeSchema.parse(query);
}
