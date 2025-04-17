import { z } from "zod";
import { supabaseAdminClient } from "~/lib/supabase/server";
import { passwordSchema } from "~/schemas/auth";
import { generateFromEmail } from "unique-username-generator";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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
          const userCount = await tx.user.count();
          const isFirstUser = userCount === 0;
          const role = isFirstUser ? "OWNER" : "STAFF";

          // Create auth user
          const { data, error } = await supabaseAdminClient.auth.signUp({
            email,
            password,
          });

          if (data.user) userId = data.user.id;
          if (error) throw error;

          // Create user record
          const user = await tx.user.create({
            data: {
              id: data.user!.id,
              email,
              username: generateFromEmail(email),
              pin: Math.floor(1000 + Math.random() * 9000).toString(),
              role,
              isActive: true,
            },
          });

          // If owner, create their warung
          if (isFirstUser) {
            await tx.warung.create({
              data: {
                name: "Warung Pertamaku",
                owner: { connect: { id: user.id } },
                // Create default payment methods
                debtPayments: {
                  create: [], // Initialize empty
                },
                stockAdjustments: {
                  create: [], // Initialize empty
                },
                // Create default categories
                categories: {
                  create: [
                    { name: "Makanan" },
                    { name: "Minuman" },
                    { name: "Snack" },
                  ],
                },
              },
            });
          }

          return {
            success: true,
            isFirstUser,
            userId: user.id,
            role: user.role,
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
});
