import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { authenticator } from "otplib";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { sendVerificationEmail } from "~/lib/email";

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

  // Generate secret and send verification email
  generateMfaSecret: privateProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user?.email) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Email is required for MFA setup",
      });
    }

    const secret = authenticator.generateSecret();

    const token = authenticator.generate(secret);

    await sendVerificationEmail({
      email: ctx.user.email,
      token,
    });

    return { secret };
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

      if (!user?.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User email not found",
        });
      }

      // Set options to allow for time skew
      authenticator.options = { window: 1 };

      const verified = authenticator.check(token, secret);

      if (!verified) {
        // Generate and send new code if verification fails
        const newToken = authenticator.generate(secret);
        await sendVerificationEmail({
          email: user.email,
          token: newToken,
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid code. A new code has been sent to your email.",
        });
      }

      const backupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      await db.user.update({
        where: { id: user.id },
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

  // Send a new verification code (for login)
  sendMfaCode: privateProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const userData = await db.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        email: true,
        mfaEnabled: true,
        mfaSecret: true,
      },
    });

    if (!userData?.email || !userData?.mfaEnabled || !userData.mfaSecret) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "MFA not properly configured",
      });
    }

    // Use the same authenticator options for consistency
    authenticator.options = { window: 1 };

    // Generate new code using stored secret
    const token = authenticator.generate(userData.mfaSecret);

    // Send verification email
    await sendVerificationEmail({
      email: userData.email,
      token,
    });

    return { success: true };
  }),
});
