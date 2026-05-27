import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import {
  assertStaffOrAbove,
  assertManagerOrOwner,
  getAuthorizedWarungIds,
} from "~/server/api/utils/roles";

export const shiftRouter = createTRPCRouter({
  openShift: privateProcedure
    .input(z.object({ warungId: z.string(), startCash: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { warungId, startCash } = input;

      await assertStaffOrAbove(db, warungId, user?.id);

      const shift = await db.shift.create({
        data: { warungId, userId: user!.id, startCash },
      });

      await db.warungActivity.create({
        data: {
          type: "SHIFT_OPENED",
          description: `Shift opened`,
          warungId,
          userId: user!.id,
        },
      });

      return shift;
    }),

  closeShift: privateProcedure
    .input(
      z.object({
        shiftId: z.string(),
        endCash: z.number().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { shiftId, endCash, notes } = input;

      const shift = await db.shift.findUnique({ where: { id: shiftId } });
      if (!shift) throw new TRPCError({ code: "NOT_FOUND" });

      await assertStaffOrAbove(db, shift.warungId, user?.id);

      const updated = await db.shift.update({
        where: { id: shiftId },
        data: { endTime: new Date(), endCash, notes },
      });

      await db.warungActivity.create({
        data: {
          type: "SHIFT_CLOSED",
          description: `Shift closed`,
          warungId: shift.warungId,
          userId: user!.id,
        },
      });

      return updated;
    }),

  listShifts: privateProcedure
    .input(z.object({ warungId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      if (!user?.id) return [];

      if (input.warungId) {
        // manager/owner can list all shifts, staff can list only their own
        const authorized = await getAuthorizedWarungIds(db, user.id);
        if (!authorized.includes(input.warungId)) return [];

        // if staff but not manager/owner, filter to user's shifts only
        const isManagerOrOwner = await (async () => {
          const warung = await db.warung.findUnique({
            where: { id: input.warungId },
            select: { ownerId: true },
          });
          if (warung?.ownerId === user.id) return true;
          const staff = await db.warungStaff.findFirst({
            where: {
              warungId: input.warungId,
              userId: user.id,
              role: { in: ["OWNER", "MANAGER"] },
            } as any,
          });
          return !!staff;
        })();

        return db.shift.findMany({
          where: isManagerOrOwner
            ? { warungId: input.warungId }
            : { warungId: input.warungId, userId: user.id },
          orderBy: { startTime: "desc" },
        });
      }

      const authorizedWarungIds = await getAuthorizedWarungIds(db, user.id);
      if (authorizedWarungIds.length === 0) return [];

      return db.shift.findMany({
        where: { warungId: { in: authorizedWarungIds } },
        orderBy: { startTime: "desc" },
      });
    }),
});
