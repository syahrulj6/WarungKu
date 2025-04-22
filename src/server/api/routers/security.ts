import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as speakeasy from "speakeasy";
import { authenticator } from "otplib";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const securityRouter = createTRPCRouter({
  generateMfaSecret: privateProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    const secret = speakeasy.generateSecret({
      length: 20,
      name: `WarungKu (${user?.id})`,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
    };
  }),

  enabledMfa: privateProcedure
    .input(
      z.object({
        token: z.string(),
        secret: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { secret, token } = input;

      const verified = authenticator.check(input.token, input.secret);

      if (!verified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification code",
        });
      }

      const backupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      await db.user.update({
        where: {
          id: user?.id,
        },
        data: {
          mfaEnabled: true,
          mfaSecret: secret,
          mfaBackupCodes: backupCodes,
        },
      });
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
