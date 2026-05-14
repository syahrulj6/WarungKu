import { z } from "zod";

const optionalUrl = z
  .string()
  .optional()
  .transform((value) => (value?.trim() ? value.trim() : undefined))
  .refine((value) => !value || /^https?:\/\/.+/.test(value), {
    message: "URL logo tidak valid",
  });

export const updateKasirFormSchema = z.object({
  warungId: z.string().uuid("Invalid Kasir ID"),
  name: z
    .string()
    .min(1, "Nama kasir wajib diisi")
    .max(100, "Nama kasir maksimal 100 karakter"),
  address: z
    .string()
    .max(500, "Alamat maksimal 500 karakter")
    .optional(),
  phone: z
    .string()
    .max(20, "Nomor telepon maksimal 20 karakter")
    .optional(),
  logoUrl: optionalUrl,
  isActive: z.boolean().optional(),
});

export type UpdateKasirFormSchema = z.infer<typeof updateKasirFormSchema>;


