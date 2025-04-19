import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

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
});
