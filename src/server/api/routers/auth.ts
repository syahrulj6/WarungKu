import { TRPCError } from "@trpc/server";
import { authenticator } from "otplib";
import { Prisma } from "@prisma/client";
import { generateFromEmail } from "unique-username-generator";
import { z } from "zod";
import {
  clearSessionCookies,
  hashPassword,
  setSessionCookies,
  verifyPassword,
} from "~/lib/auth/server";
import { passwordSchema } from "~/schemas/auth";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  currentUser: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      username: ctx.user.username,
      isActive: ctx.user.isActive,
      mfaEnabled: ctx.user.mfaEnabled,
    };
  }),

  register: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        password: passwordSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const passwordHash = await hashPassword(input.password);

      try {
        const user = await ctx.db.user.create({
          data: {
            email: input.email,
            username: generateFromEmail(input.email),
            passwordHash,
            isActive: true,
            mfaBackupCodes: [],
          },
        });

        return {
          success: true,
          userId: user.id,
        };
      } catch (error) {
        console.error("Registration error:", error);

        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already registered",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed. Please try again.",
        });
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
        password: passwordSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      const passwordIsValid = await verifyPassword(
        input.password,
        user?.passwordHash,
      );

      if (!user || !passwordIsValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email atau password salah",
        });
      }

      if (!user.isActive) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Akun tidak aktif",
        });
      }

      setSessionCookies(ctx.res, user.id, { mfaVerified: !user.mfaEnabled });

      return { success: true, mfaRequired: user.mfaEnabled };
    }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    clearSessionCookies(ctx.res);
    return { success: true };
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

      const passwordIsValid = await verifyPassword(
        currentPassword,
        user.passwordHash,
      );

      if (!passwordIsValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        });
      }

      await ctx.db.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(newPassword) },
      });

      return { success: true };
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

      authenticator.options = { window: 1 };

      const verified = authenticator.check(input.token, dbUser.mfaSecret);

      if (!verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid verification code",
        });
      }

      setSessionCookies(ctx.res, user.id, { mfaVerified: true });

      return { success: true };
    }),
});
