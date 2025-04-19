import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";

export const warungRouter = createTRPCRouter({
  getWarung: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const warung = await db.warung.findMany({
      where: {
        ownerId: user?.id,
      },
      include: {
        subscriptions: true,
      },
    });

    return warung;
  }),
});
