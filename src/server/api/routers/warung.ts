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

        const result = await db.$transaction(async (tx) => {
          const newWarung = await tx.warung.create({
            data: {
              name,
              address,
              logoUrl,
              phone,
              ownerId: user!.id,
              isActive: true,
            },
          });

          await tx.category.createMany({
            data: [
              { name: "Food", warungId: newWarung.id },
              { name: "Beverage", warungId: newWarung.id },
              { name: "Snack", warungId: newWarung.id },
            ],
          });

          return newWarung;
        });

        return result;
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

  updateWarung: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        name: z.string().min(1).max(100),
        address: z.string().max(255).optional(),
        logoUrl: z.string().url().optional(),
        phone: z.string().max(20).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { warungId, name, address, logoUrl, phone } = input;
      const warung = await db.warung.findUnique({
        where: {
          id: warungId,
          ownerId: user?.id,
        },
      });
      if (!warung) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Warung not found",
        });
      }

      if (warung.name === name) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Warung with this name already exists",
        });
      }

      try {
        const updatedWarung = await db.warung.update({
          where: {
            id: warungId,
          },
          data: {
            name,
            address,
            logoUrl,
            phone,
          },
        });

        return updatedWarung;
      } catch (error) {
        console.error("Failed to update warung:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update warung",
        });
      }
    }),

  getWarungActivities: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { warungId, startDate, endDate } = input;
      const { db } = ctx;

      return db.warungActivity.findMany({
        where: {
          warungId,
          ...(startDate &&
            endDate && {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }),
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
