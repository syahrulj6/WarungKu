import { z } from "zod";

export const createProductFormSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  price: z.number().min(100, "Harga minimal Rp 100"),
  costPrice: z.number().min(0).optional(),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  minStock: z.number().min(0).optional(),
  categoryId: z.string().optional(),
});

export type CreateProductFormSchema = z.infer<
  typeof createProductFormSchema
> & {
  productPictureBase64?: string;
};
