import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import {
  assertManagerOrOwner,
  getAuthorizedWarungIds,
} from "~/server/api/utils/roles";
import { TRPCError } from "@trpc/server";
import { createKasirFormSchema } from "~/schemas/kasir";

export const kasirRouter = createTRPCRouter({
  getKasir: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    const authorizedWarungIds = await getAuthorizedWarungIds(db, user?.id);

    return db.warung.findMany({
      where: {
        id: { in: authorizedWarungIds },
      },
      include: { subscriptions: true },
    });
  }),

  getKasirById: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { warungId } = input;
      await assertManagerOrOwner(db, warungId, user?.id);

      return db.warung.findFirst({ where: { id: warungId } });
    }),

  searchKasirByName: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, "Search term cannot be empty").max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { name } = input;

      try {
        const authorizedWarungIds = await getAuthorizedWarungIds(db, user?.id);

        return await db.warung.findMany({
          where: {
            id: { in: authorizedWarungIds },
            name: { contains: name, mode: "insensitive" },
          },
          include: { subscriptions: true },
          take: 10,
          orderBy: { name: "asc" },
        });
      } catch (error) {
        console.error("Search failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to perform search",
        });
      }
    }),

  createKasir: privateProcedure
    .input(createKasirFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { name, address, logoUrl, phone } = input;

      try {
        const existingKasir = await db.warung.findFirst({
          where: {
            ownerId: user?.id,
            name,
          },
        });

        if (existingKasir) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You already have a kasir with this name",
          });
        }

        return await db.$transaction(async (tx) => {
          const newKasir = await tx.warung.create({
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
              { name: "Food", warungId: newKasir.id },
              { name: "Beverage", warungId: newKasir.id },
              { name: "Snack", warungId: newKasir.id },
            ],
          });

          return newKasir;
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Failed to create kasir:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create kasir",
        });
      }
    }),

  updateKasir: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        name: z.string().min(1).max(100).optional(),
        address: z.string().max(255).optional(),
        logoUrl: z.string().url().optional(),
        phone: z.string().max(20).optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { warungId, name, address, logoUrl, phone, isActive } = input;

      const kasir = await db.warung.findFirst({
        where: {
          id: warungId,
          ownerId: user?.id,
        },
      });
      if (!kasir) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kasir not found",
        });
      }

      if (name && name !== kasir.name) {
        const existingKasir = await db.warung.findFirst({
          where: {
            ownerId: user?.id,
            name,
            id: {
              not: warungId,
            },
          },
        });

        if (existingKasir) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Kasir with this name already exists",
          });
        }
      }

      try {
        return await db.warung.update({
          where: {
            id: warungId,
          },
          data: {
            ...(name !== undefined ? { name } : {}),
            address,
            logoUrl,
            phone,
            ...(isActive !== undefined ? { isActive } : {}),
          },
        });
      } catch (error) {
        console.error("Failed to update kasir:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update kasir",
        });
      }
    }),

  getKasirActivities: privateProcedure
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

      // ensure manager/owner for the requested warung
      await assertManagerOrOwner(db, warungId, (ctx.user as any)?.id);

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
        orderBy: { createdAt: "desc" },
      });
    }),
});
