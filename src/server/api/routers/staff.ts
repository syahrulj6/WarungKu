import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { randomUUID } from "crypto";
import { sendInvitationEmail } from "~/lib/email";
import { getAppBaseUrl } from "~/lib/url";
import {
  assertManagerOrOwner,
  getAuthorizedWarungIds,
} from "~/server/api/utils/roles";

export const staffRouter = createTRPCRouter({
  createInvitation: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        email: z.string().email(),
        role: z.enum(["OWNER", "MANAGER", "STAFF", "CASHIER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { warungId, email, role } = input;

      if (!user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      // only owner or manager can invite
      await assertManagerOrOwner(db, warungId, user.id);

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

      await db.staffInvitation.create({
        data: {
          email,
          role,
          token,
          expiresAt,
          warung: { connect: { id: warungId } },
          invitedBy: { connect: { id: user.id } },
        },
      });

      const baseUrl = getAppBaseUrl(ctx.req);
      const acceptUrl = `${baseUrl}/invitations/accept?token=${token}`;

      try {
        await sendInvitationEmail({ email, invitationUrl: acceptUrl });
      } catch (err) {
        console.error("Failed to send invite email:", err);
      }

      return { success: true, token };
    }),

  acceptInvitation: privateProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { token } = input;

      if (!user?.id || !user?.email)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const invitation = await db.staffInvitation.findUnique({
        where: { token },
      });
      if (!invitation)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      if (invitation.expiresAt < new Date())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation expired",
        });
      if (invitation.email !== user.email)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invitation email does not match your account",
        });

      const existingStaff = await db.warungStaff.findFirst({
        where: { warungId: invitation.warungId, userId: user.id },
        select: { id: true },
      });

      if (!existingStaff) {
        await db.warungStaff.create({
          data: {
            warungId: invitation.warungId,
            userId: user.id,
            role: invitation.role,
          },
        });
      }

      await db.staffInvitation.delete({ where: { id: invitation.id } });

      await db.warungActivity.create({
        data: {
          type: "STAFF_ADDED",
          description: `User ${user.email} joined as ${invitation.role}`,
          warungId: invitation.warungId,
          userId: user.id,
        },
      });

      return { success: true };
    }),

  listStaff: privateProcedure
    .input(z.object({ warungId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      if (!user?.id) return [];

      if (input.warungId) {
        await assertManagerOrOwner(db, input.warungId, user.id);
        return db.warungStaff.findMany({
          where: { warungId: input.warungId },
          include: { user: true },
        });
      }

      const authorizedWarungIds = await getAuthorizedWarungIds(db, user.id);
      if (authorizedWarungIds.length === 0) return [];

      return db.warungStaff.findMany({
        where: { warungId: { in: authorizedWarungIds } },
        include: { user: true },
      });
    }),

  updateRole: privateProcedure
    .input(
      z.object({
        staffId: z.string(),
        role: z.enum(["OWNER", "MANAGER", "STAFF", "CASHIER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { staffId, role } = input;
      if (!user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      const staff = await db.warungStaff.findUnique({ where: { id: staffId } });
      if (!staff) throw new TRPCError({ code: "NOT_FOUND" });

      await assertManagerOrOwner(db, staff.warungId, user.id);

      const updated = await db.warungStaff.update({
        where: { id: staffId },
        data: { role },
      });

      await db.warungActivity.create({
        data: {
          type: "STAFF_ADDED",
          description: `Role updated to ${role}`,
          warungId: staff.warungId,
          userId: user.id,
        },
      });

      return updated;
    }),

  removeStaff: privateProcedure
    .input(z.object({ staffId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { staffId } = input;
      if (!user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });

      const staff = await db.warungStaff.findUnique({ where: { id: staffId } });
      if (!staff) throw new TRPCError({ code: "NOT_FOUND" });

      await assertManagerOrOwner(db, staff.warungId, user.id);

      await db.warungStaff.delete({ where: { id: staffId } });

      await db.warungActivity.create({
        data: {
          type: "STAFF_REMOVED",
          description: `Staff removed`,
          warungId: staff.warungId,
          userId: user.id,
        },
      });

      return { success: true };
    }),
});
