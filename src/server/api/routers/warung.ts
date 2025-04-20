import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const warungRouter = createTRPCRouter({
  getWarung: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const warung = await db.warung.findMany({
      where: {
        ownerId: user?.id,
      },
      include: {
        subscriptions: true,
      },
    });

    return warung;
  }),

  searchWarungByName: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, "Search term cannot be empty").max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { name } = input;

      try {
        const warungs = await db.warung.findMany({
          where: {
            ownerId: user?.id, // Ensure we only search user's warungs
            name: {
              contains: name,
              mode: "insensitive",
            },
          },
          include: {
            subscriptions: true, // Include subscriptions
          },
          take: 10,
          orderBy: {
            name: "asc",
          },
        });

        return warungs; // Return array directly to match getWarung format
      } catch (error) {
        console.error("Search failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to perform search",
        });
      }
    }),
});
