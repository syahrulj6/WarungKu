import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { supabaseAdminClient } from "~/lib/supabase/server";
import { SUPABASE_BUCKET } from "~/lib/supabase/bucket";

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
