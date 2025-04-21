import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  getProfile: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const profile = await db.user.findUnique({
      where: {
        id: user?.id,
      },
      select: {
        username: true,
        email: true,
        id: true,
      },
    });

    return profile;
  }),

  updateProfile: privateProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3)
          .max(16)
          .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores",
          )
          .transform((val) => val.toLowerCase().trim()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { username } = input;

      if (username) {
        const usernameExists = await db.user.findFirst({
          where: {
            username,
          },
          select: {
            id: true,
          },
        });

        if (usernameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username is already taken",
          });
        }
      }

      const updatedUser = await db.user.update({
        where: {
          id: user?.id,
        },
        data: {
          username,
        },
      });

      return updatedUser;
    }),
});
