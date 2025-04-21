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
        throw new Error("Unauthorized");
      }

      const userEmail = user.email;
      const { error: signInError } =
        await supabaseAdminClient.auth.signInWithPassword({
          email: userEmail!,
          password: currentPassword,
        });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      const { data, error: updateError } =
        await supabaseAdminClient.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        throw new Error("Failed to update password");
      }

      return { success: true, data };
    }),
});
