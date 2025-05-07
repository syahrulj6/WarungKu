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

      const warung = await db.warung.findFirst({
        where: { ownerId: user.id },
      });

      if (!warung) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Anda belum memiliki warung",
        });
      }

      let productPictureUrl: string | undefined = undefined;
      const timestamp = new Date().getTime().toString();

      if (productPictureBase64) {
        const fileName = `product-${user.id}-${Date.now()}.jpeg`;
        const buffer = Buffer.from(productPictureBase64, "base64");

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

        productPictureUrl = publicUrlData.publicUrl + "?t=" + timestamp;
      }

      const product = await db.product.create({
        data: {
          name: productData.name,
          price: productData.price,
          stock: productData.stock,
          costPrice: productData.costPrice ?? 0,
          minStock: productData.minStock,
          productPictureUrl,
          warung: {
            connect: {
              id: warung.id,
            },
          },
          ...(productData.categoryId && {
            category: {
              connect: {
                id: productData.categoryId,
              },
            },
          }),
        },
        include: {
          category: true,
          warung: true,
        },
      });

      await db.warungActivity.create({
        data: {
          type: ActivityType.PRODUCT_ADDED,
          description: `Produk ${product.name} ditambahkan`,
          warungId: warung.id,
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
