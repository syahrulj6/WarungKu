import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { createProductFormSchema } from "~/schemas/product";
import { SUPABASE_BUCKET } from "~/lib/supabase/bucket";
import { z } from "zod";
import { supabaseAdminClient } from "~/lib/supabase/server";
import { ActivityType } from "@prisma/client";

export const productRouter = createTRPCRouter({
  getAllProduct: privateProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    try {
      const products = await db.product.findMany({
        orderBy: { stock: "desc" },
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
    const { db } = ctx;

    try {
      const products = await db.product.findMany({
        orderBy: { stock: "desc" },
        take: 4,
      });
      return products;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch products",
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

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      let productPictureUrl: string | undefined = undefined;
      const timestamp = new Date().getTime().toString();

      // Handle image upload if provided
      if (productPictureBase64) {
        const fileName = `product-${user.id}-${Date.now()}.jpeg`;
        const buffer = Buffer.from(productPictureBase64, "base64");

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
            message: "Failed to upload product image",
          });
        }

        // Get public URL
        const { data: publicUrlData } = supabaseAdminClient.storage
          .from(SUPABASE_BUCKET.ProductPictures)
          .getPublicUrl(data.path);

        productPictureUrl = publicUrlData.publicUrl + "?t=" + timestamp;
      }

      // Create the product in database
      const product = await db.product.create({
        data: {
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          costPrice: productData.costPrice ?? 0,
          minStock: productData.minStock,
          productPictureUrl,
          warungId: user.id,
          ...(productData.categoryId && {
            categoryId: productData.categoryId,
          }),
        },
        include: {
          category: true,
        },
      });

      await db.warungActivity.create({
        data: {
          type: ActivityType.PRODUCT_ADDED,
          description: `Product ${product.name} created`,
          warungId: user.id,
          userId: user.id,
          productId: product.id,
          metadata: {
            name: product.name,
            price: product.price,
            stock: product.stock,
          },
        },
      });

      return product;
    }),
});
