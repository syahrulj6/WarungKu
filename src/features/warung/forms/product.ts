import { z } from "zod";

export const createProductFormSchema = z.object({
  name: z
    .string()
    .min(3, "Nama produk minimal 3 karakter")
    .max(100, "Nama produk maksimal 100 karakter"),
  price: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .max(100000000, "Harga terlalu besar"),
  costPrice: z
    .number()
    .min(0, "Harga modal tidak boleh negatif")
    .max(100000000, "Harga modal terlalu besar")
    .optional(),
  stock: z
    .number()
    .int("Stok harus bilangan bulat")
    .min(0, "Stok tidak boleh negatif"),
  minStock: z
    .number()
    .int("Stok minimum harus bilangan bulat")
    .min(0, "Stok minimum tidak boleh negatif")
    .optional(),
  categoryId: z.string().optional(),
});

export type CreateProductFormSchema = z.infer<typeof createProductFormSchema>;
