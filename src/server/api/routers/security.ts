import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authenticator } from "otplib";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const securityRouter = createTRPCRouter({
  getMfaStatus: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user?.id },
      select: {
        mfaEnabled: true,
      },
    });

    return {
      mfaEnabled: user?.mfaEnabled ?? false,
    };
  }),

  generateMfaSecret: privateProcedure.mutation(async ({ ctx }) => {
    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Create OTPAuth URL for QR code
    const otpauthUrl = authenticator.keyuri(
      ctx.user?.email || ctx.user?.id || "user", // Identifier
      "WarungKu", // Your service name
      secret,
    );

    return {
      secret,
      otpauthUrl,
    };
  }),

  enableMfa: privateProcedure
    .input(
      z.object({
        token: z.string().length(6, "Must be a 6-digit code"),
        secret: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { secret, token } = input;

      // Verify the token
      const verified = authenticator.check(token, secret);

      if (!verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      // Update user in database
      await db.user.update({
        where: { id: user?.id },
        data: {
          mfaEnabled: true,
          mfaSecret: secret,
          mfaBackupCodes: backupCodes,
        },
      });

      return { backupCodes };
    }),

  disableMfa: privateProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    await db.user.update({
      where: { id: user?.id },
      data: {
        mfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });

    return { success: true };
  }),
});
