import { z } from "zod";
import { emailSchema, passwordSchema } from "~/schemas/auth";

export const authFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type AuthFormSchema = z.infer<typeof authFormSchema>;

// export const resetPasswordSchema = z
//   .object({
//     password: passwordSchema,
//     confirmPassword: passwordSchema,
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
