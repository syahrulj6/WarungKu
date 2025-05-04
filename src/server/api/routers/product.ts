import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";

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
});
