import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createWarungFormSchema } from "~/schemas/warung";

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

  getWarungById: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { warungId } = input;

      const warung = await db.warung.findUnique({
        where: {
          id: warungId,
          ownerId: user?.id,
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

  createWarung: privateProcedure
    .input(createWarungFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { name, address, logoUrl, phone } = input;

      try {
        const existingWarung = await db.warung.findFirst({
          where: {
            ownerId: user?.id,
            name: name,
          },
        });

        if (existingWarung) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You already have a warung with this name",
          });
        }

        const newWarung = await db.warung.create({
          data: {
            name,
            address,
            logoUrl,
            phone,
            ownerId: user!.id,
            isActive: true,
          },
        });

        return newWarung;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Failed to create warung:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create warung",
        });
      }
    }),
});
