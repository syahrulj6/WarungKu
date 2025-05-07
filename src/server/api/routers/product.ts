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

      // Verify user and warung
      const warung = await db.warung.findFirst({
        where: { ownerId: user?.id },
      });

      if (!warung) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Warung not found",
        });
      }

      // Handle image upload
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

      // Create product
      const product = await db.product.create({
        data: {
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          costPrice: productData.costPrice ?? 0,
          minStock: productData.minStock,
          productPictureUrl,
          warungId: warung.id, // Direct assignment
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

      // Create activity log
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

// Helper function to handle image upload
async function handleImageUpload(
  imageBase64: string | undefined,
  userId: string,
): Promise<string | undefined> {
  if (!imageBase64) return undefined;

  const fileName = `product-${userId}-${Date.now()}.jpeg`;
  const buffer = Buffer.from(imageBase64, "base64");

  // Upload to Supabase storage
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

  // Get public URL with cache-busting timestamp
  const { data: publicUrlData } = supabaseAdminClient.storage
    .from(SUPABASE_BUCKET.ProductPictures)
    .getPublicUrl(data.path);

  return `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;
}

// Helper function to delete image from storage
async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl);
    const filePath = url.pathname.split("/").pop()?.split("?")[0];

    if (!filePath) return;

    // Delete file from storage
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
