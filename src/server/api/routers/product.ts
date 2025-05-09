import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { createProductFormSchema } from "~/schemas/product";
import { SUPABASE_BUCKET } from "~/lib/supabase/bucket";
import { z } from "zod";
import { supabaseAdminClient } from "~/lib/supabase/server";
import { ActivityType } from "@prisma/client";

export const productRouter = createTRPCRouter({
  getAllProduct: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    try {
      const products = await db.product.findMany({
        where: {
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
    } catch (error) {
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
      } catch (error) {
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
      } catch (error) {
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
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch trending products",
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
          message: "Warung not found",
        });
      }

      let productPictureUrl: string | undefined;
      if (productPictureBase64) {
        const fileName = `product-${user!.id}-${Date.now()}.jpeg`;
        const buffer = Buffer.from(productPictureBase64, "base64");

        const { data, error } = await supabaseAdminClient.storage
          .from(SUPABASE_BUCKET.ProductPictures)
          .upload(fileName, buffer, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to upload image",
          });

        const { data: publicUrlData } = supabaseAdminClient.storage
          .from(SUPABASE_BUCKET.ProductPictures)
          .getPublicUrl(data.path);

        productPictureUrl = publicUrlData.publicUrl;
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

      return product;
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
});

async function handleImageUpload(
  imageBase64: string | undefined,
  userId: string,
): Promise<string | undefined> {
  if (!imageBase64) return undefined;

  const fileName = `product-${userId}-${Date.now()}.jpeg`;
  const buffer = Buffer.from(imageBase64, "base64");

  const { data, error } = await supabaseAdminClient.storage
    .from(SUPABASE_BUCKET.ProductPictures)
    .upload(fileName, buffer, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Gagal mengupload gambar produk",
    });
  }

  const { data: publicUrlData } = supabaseAdminClient.storage
    .from(SUPABASE_BUCKET.ProductPictures)
    .getPublicUrl(data.path);

  return `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
}

async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    const url = new URL(imageUrl);
    const filePath = url.pathname.split("/").pop()?.split("?")[0];

    if (!filePath) return;

    const { error } = await supabaseAdminClient.storage
      .from(SUPABASE_BUCKET.ProductPictures)
      .remove([filePath]);

    if (error) {
      console.error("Failed to delete image:", error);
    }
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
