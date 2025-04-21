import { z } from "zod";
export const profileSettingFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username minimal 3 karakter" })
    .max(16, { message: "Username maksimal 16 karakter" }),
});

export type ProfileSettingFormSchema = z.infer<typeof profileSettingFormSchema>;
