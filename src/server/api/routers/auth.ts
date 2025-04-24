import { z } from "zod";
import { supabaseAdminClient } from "~/lib/supabase/server";
import { passwordSchema } from "~/schemas/auth";
import { generateFromEmail } from "unique-username-generator";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { authenticator } from "otplib";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        password: passwordSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { email, password } = input;

      return await db.$transaction(async (tx) => {
        let userId = "";

        try {
          const { data, error } = await supabaseAdminClient.auth.signUp({
            email,
            password,
          });

          if (data.user) userId = data.user.id;
          if (error) throw error;

          const user = await tx.user.create({
            data: {
              id: data.user!.id,
              email,
              username: generateFromEmail(email),
              isActive: true,
            },
          });

          return {
            success: true,
            userId: user.id,
          };
        } catch (error) {
          console.error("Registration error:", error);
          if (userId) {
            await supabaseAdminClient.auth.admin.deleteUser(userId);
          }
          throw new Error("Registration failed. Please try again.");
        }
      });
    }),

  changePassword: privateProcedure
    .input(
      z.object({
        currentPassword: passwordSchema,
        newPassword: passwordSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;
      const { user } = ctx;

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        });
      }

      const userEmail = user.email;
      const { error: signInError } =
        await supabaseAdminClient.auth.signInWithPassword({
          email: userEmail!,
          password: currentPassword,
        });

      if (signInError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      const { data, error: updateError } =
        await supabaseAdminClient.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update password",
        });
      }

      return { success: true, data };
    }),

  checkMfaRequired: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user?.id },
      select: { mfaEnabled: true },
    });

    return { mfaRequired: user?.mfaEnabled ?? false };
  }),

  verifyMfaLogin: privateProcedure
    .input(z.object({ token: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
          mfaEnabled: true,
          mfaSecret: true,
        },
      });

      if (!dbUser?.mfaEnabled || !dbUser?.mfaSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "MFA not configured for this user",
        });
      }

      // Set options to allow for time skew (1 period before and after current)
      authenticator.options = { window: 1 };

      const verified = authenticator.check(input.token, dbUser.mfaSecret);

      if (!verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid verification code",
        });
      }

      return { success: true };
    }),
});
