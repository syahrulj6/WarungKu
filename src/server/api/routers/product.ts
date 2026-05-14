import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { createProductFormSchema } from "~/schemas/product";
import { z } from "zod";
import { ActivityType } from "@prisma/client";
import {
  deleteProductPicture,
  saveProductPicture,
} from "~/lib/storage/product-pictures";

export const productRouter = createTRPCRouter({
  getAllProduct: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    try {
      const products = await db.product.findMany({
        where: {
          isActive: true,
          warung: {
            ownerId: user!.id,
          },
        },
        orderBy: { stock: "desc" },
        include: {
          category: true,
        },
      });
      return products;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch products",
      });
    }
  }),

  getAllProductByCategory: privateProcedure
    .input(
      z.object({
        categoryId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { categoryId } = input;

      try {
        const products = await db.product.findMany({
          where: {
            AND: [
              {
                isActive: true,
              },
              {
                warung: {
                  ownerId: user!.id,
                },
              },
              {
                categoryId: categoryId,
              },
            ],
          },
          orderBy: { stock: "desc" },
          include: {
            category: true,
          },
        });
        return products;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
        });
      }
    }),

  searchMenuByNames: privateProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { name } = input;

      try {
        const products = await db.product.findMany({
          where: {
            AND: [
              {
                isActive: true,
              },
              {
                warung: {
                  ownerId: user!.id,
                },
              },
              {
                name: {
                  contains: name,
                  mode: "insensitive",
                },
              },
            ],
          },
          orderBy: { stock: "desc" },
          include: {
            category: true,
          },
        });
        return products;
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch products",
        });
      }
    }),

  getTrendingProduct: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    try {
      const products = await db.product.findMany({
        where: {
          isActive: true,
          warung: {
            ownerId: user!.id,
          },
        },
        orderBy: { stock: "desc" },
        take: 4,
        include: {
          category: true,
        },
      });
      return products;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch trending products",
      });
    }
  }),

  getLowStockProduct: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;

      try {
        const warung = await db.warung.findFirst({
          where: {
            id: input.warungId,
            ownerId: user!.id,
          },
          select: { id: true },
        });

        if (!warung) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "warung tidak ditemukan atau bukan milik Anda",
          });
        }

        const products = await db.product.findMany({
          where: {
            warungId: input.warungId,
            isActive: true,
          },
          include: {
            category: true,
          },
        });

        const lowStockProducts = products
          .filter((product) => product.stock <= (product.minStock ?? 5))
          .sort((a, b) => {
            const aGap = (a.minStock ?? 5) - a.stock;
            const bGap = (b.minStock ?? 5) - b.stock;
            return bGap - aGap;
          })
          .slice(0, input.limit ?? 20)
          .map((product) => ({
            ...product,
            threshold: product.minStock ?? 5,
            status:
              product.stock <= 0
                ? ("OUT_OF_STOCK" as const)
                : ("LOW_STOCK" as const),
            stockGap: (product.minStock ?? 5) - product.stock,
          }));

        return lowStockProducts;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal mengambil data stok rendah",
        });
      }
    }),

  createProduct: privateProcedure
    .input(
      createProductFormSchema.extend({
        productPictureBase64: z.string().base64().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { productPictureBase64, ...productData } = input;

      const warung = await db.warung.findFirst({
        where: { ownerId: user?.id },
      });

      if (!warung) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kasirium not found",
        });
      }

      if (productData.categoryId) {
        const category = await db.category.findFirst({
          where: {
            id: productData.categoryId,
            warungId: warung.id,
          },
          select: { id: true },
        });

        if (!category) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Kategori tidak valid",
          });
        }
      }

      let productPictureUrl: string | undefined;
      if (productPictureBase64) {
        productPictureUrl = await saveProductPicture(
          productPictureBase64,
          user!.id,
        );
      }

      const product = await db.product.create({
        data: {
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          costPrice: productData.costPrice ?? 0,
          minStock: productData.minStock,
          productPictureUrl,
          warungId: warung.id,
          ...(productData.categoryId && { categoryId: productData.categoryId }),
        },
      });

      await createProductActivity(db, {
        type: ActivityType.PRODUCT_ADDED,
        description: `Produk ${product.name} ditambahkan`,
        warungId: warung.id,
        userId: user!.id,
        productId: product.id,
      });

      return product;
    }),

  updateProduct: privateProcedure
    .input(
      z.object({
        productId: z.string(),
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
        categoryId: z
          .string({ required_error: "Kategori wajib dipilih" })
          .min(1, "Kategori wajib dipilih"),
        productPictureBase64: z.string().base64().optional(),
        removeProductPicture: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const product = await db.product.findFirst({
        where: {
          id: input.productId,
          isActive: true,
          warung: { ownerId: user!.id },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan",
        });
      }

      const category = await db.category.findFirst({
        where: {
          id: input.categoryId,
          warungId: product.warungId,
        },
        select: { id: true },
      });

      if (!category) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kategori tidak valid",
        });
      }

      let nextProductPictureUrl: string | null = product.productPictureUrl;

      if (input.removeProductPicture && product.productPictureUrl) {
        await deleteImageFromStorage(product.productPictureUrl);
        nextProductPictureUrl = null;
      }

      if (input.productPictureBase64) {
        const uploadedPicture = await handleImageUpload(
          input.productPictureBase64,
          user!.id,
        );
        if (product.productPictureUrl) {
          await deleteImageFromStorage(product.productPictureUrl);
        }
        nextProductPictureUrl = uploadedPicture ?? null;
      }

      const updatedProduct = await db.product.update({
        where: { id: product.id },
        data: {
          name: input.name,
          price: input.price,
          costPrice: input.costPrice ?? 0,
          stock: input.stock,
          minStock: input.minStock,
          categoryId: input.categoryId,
          productPictureUrl: nextProductPictureUrl,
        },
      });

      await createProductActivity(db, {
        type: ActivityType.PRODUCT_UPDATED,
        description: `Produk ${product.name} diupdate`,
        warungId: product.warungId,
        userId: user!.id,
        productId: product.id,
      });

      return updatedProduct;
    }),

  deleteProduct: privateProcedure
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const product = await db.product.findFirst({
        where: {
          id: input.productId,
          warung: { ownerId: user!.id },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan",
        });
      }

      if (!product.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produk sudah dihapus",
        });
      }

      const deletedProduct = await db.product.update({
        where: { id: product.id },
        data: {
          isActive: false,
        },
      });

      await createProductActivity(db, {
        type: ActivityType.PRODUCT_UPDATED,
        description: `Produk ${product.name} dihapus`,
        warungId: product.warungId,
        userId: user!.id,
        productId: product.id,
      });

      return deletedProduct;
    }),

  updateProductPicture: privateProcedure
    .input(
      z.object({
        productId: z.string(),
        productPictureBase64: z.string().base64(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { productId, productPictureBase64 } = input;

      const product = await db.product.findFirst({
        where: {
          id: productId,
          warung: { ownerId: user!.id },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan",
        });
      }

      const newImageUrl = await handleImageUpload(
        productPictureBase64,
        user!.id,
      );

      if (product.productPictureUrl) {
        await deleteImageFromStorage(product.productPictureUrl);
      }

      const updatedProduct = await db.product.update({
        where: { id: productId },
        data: { productPictureUrl: newImageUrl },
      });

      await createProductActivity(db, {
        type: ActivityType.PRODUCT_UPDATED,
        description: `Foto produk ${product.name} diupdate`,
        warungId: product.warungId,
        userId: user!.id,
        productId: product.id,
      });

      return updatedProduct;
    }),

  deleteProductPicture: privateProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { productId } = input;

      const product = await db.product.findFirst({
        where: {
          id: productId,
          warung: { ownerId: user!.id },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan",
        });
      }

      if (!product.productPictureUrl) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produk tidak memiliki foto",
        });
      }

      await deleteImageFromStorage(product.productPictureUrl);

      const updatedProduct = await db.product.update({
        where: { id: productId },
        data: { productPictureUrl: null },
      });

      await createProductActivity(db, {
        type: ActivityType.PRODUCT_UPDATED,
        description: `Foto produk ${product.name} dihapus`,
        warungId: product.warungId,
        userId: user!.id,
        productId: product.id,
      });

      return updatedProduct;
    }),

  adjustProductStock: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        productId: z.string(),
        quantityToAdd: z.number().int().min(1, "Jumlah stok minimal 1"),
        reason: z.string().max(200).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { warungId, productId, quantityToAdd, reason } = input;

      const warung = await db.warung.findFirst({
        where: {
          id: warungId,
          ownerId: user!.id,
        },
      });

      if (!warung) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "warung tidak ditemukan atau bukan milik Anda",
        });
      }

      const product = await db.product.findFirst({
        where: {
          id: productId,
          warungId,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produk tidak ditemukan",
        });
      }

      const oldStock = product.stock;
      const newStock = oldStock + quantityToAdd;

      const updatedProduct = await db.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
        },
      });

      await db.stockAdjustment.create({
        data: {
          oldStock,
          newStock,
          reason: reason || "Restok dari peringatan stok rendah",
          notes: `Tambah stok ${quantityToAdd}`,
          warungId,
          productId,
          userId: user!.id,
        },
      });

      await createProductActivity(db, {
        type: ActivityType.PRODUCT_STOCK_ADJUSTED,
        description: `Stok produk ${product.name} ditambah ${quantityToAdd}`,
        warungId,
        userId: user!.id,
        productId: product.id,
        metadata: {
          oldStock,
          newStock,
          quantityToAdd,
          reason: reason || null,
        },
      });

      return updatedProduct;
    }),
});

async function handleImageUpload(
  imageBase64: string | undefined,
  userId: string,
): Promise<string | undefined> {
  if (!imageBase64) return undefined;

  const pictureUrl = await saveProductPicture(imageBase64, userId);

  return `${pictureUrl}?t=${new Date().getTime()}`;
}

async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    await deleteProductPicture(imageUrl);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
}

// Helper function to create product activity
async function createProductActivity(
  db: any,
  data: {
    type: ActivityType;
    description: string;
    warungId: string;
    userId: string;
    productId: string;
    metadata?: any;
  },
) {
  await db.warungActivity.create({
    data: {
      type: data.type,
      description: data.description,
      warungId: data.warungId,
      userId: data.userId,
      productId: data.productId,
      metadata: data.metadata,
    },
  });
}
