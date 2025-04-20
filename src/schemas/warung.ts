import { z } from "zod";

export const createWarungFormSchema = z.object({
  name: z
    .string()
    .min(1, "Warung name is required")
    .max(100, "Warung name must be less than 100 characters"),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional(),
  phone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional(),
  logoUrl: z.string().url("Must be a valid URL").optional(),
});
