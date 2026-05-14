import { TRPCError } from "@trpc/server";
import { authenticator } from "otplib";
import { Prisma } from "@prisma/client";
import { generateFromEmail } from "unique-username-generator";
import { z } from "zod";
import {
  clearSessionCookies,
  createEmailVerificationToken,
  hashPassword,
  setSessionCookies,
  verifyEmailVerificationToken,
  verifyPassword,
} from "~/lib/auth/server";
import { sendVerificationEmail } from "~/lib/email";
import { getAppBaseUrl } from "~/lib/url";
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
      const baseUrl = getAppBaseUrl(ctx.req);
      const sendVerificationLink = async (email: string) => {
        const token = createEmailVerificationToken(email);
        const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(
          token,
        )}`;

        try {
          await sendVerificationEmail({
            email,
            verificationUrl,
          });
          return true;
        } catch (error) {
          console.error("Verification email send failed:", error);
          return false;
        }
      };

      try {
        const user = await ctx.db.user.create({
          data: {
            email: input.email,
            username: generateFromEmail(input.email),
            passwordHash,
            isActive: false,
            mfaBackupCodes: [],
          },
        });

        const emailSent = await sendVerificationLink(user.email);

        return {
          success: true,
          userId: user.id,
          emailSent,
        };
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          const existingUser = await ctx.db.user.findUnique({
            where: { email: input.email },
            select: { id: true, email: true, isActive: true },
          });

          if (existingUser && !existingUser.isActive) {
            await ctx.db.user.update({
              where: { id: existingUser.id },
              data: { passwordHash },
            });

            const emailSent = await sendVerificationLink(existingUser.email);

            return {
              success: true,
              userId: existingUser.id,
              emailSent,
            };
          }

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already registered",
          });
        }

        console.error("Registration error:", error);

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
          message: "Akun belum terverifikasi. Silakan cek email Anda.",
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

  verifyEmail: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const payload = verifyEmailVerificationToken(input.token);

      if (!payload) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Link verifikasi tidak valid atau sudah kedaluwarsa",
        });
      }

      const user = await ctx.db.user.findUnique({
        where: { email: payload.email },
        select: { id: true, isActive: true },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Akun tidak ditemukan",
        });
      }

      if (!user.isActive) {
        await ctx.db.user.update({
          where: { id: user.id },
          data: { isActive: true },
        });
      }

      return { success: true };
    }),

  resendVerificationEmail: publicProcedure
    .input(
      z.object({
        email: z.string().email().toLowerCase(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
        select: { email: true, isActive: true },
      });

      // Return generic success response to avoid exposing user existence.
      if (!user || user.isActive) {
        return { success: true, emailSent: false };
      }

      const baseUrl = getAppBaseUrl(ctx.req);
      const token = createEmailVerificationToken(user.email);
      const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(
        token,
      )}`;

      try {
        await sendVerificationEmail({
          email: user.email,
          verificationUrl,
        });

        return { success: true, emailSent: true };
      } catch (error) {
        console.error("Resend verification email failed:", error);
        return { success: true, emailSent: false };
      }
    }),
});
