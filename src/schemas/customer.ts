import { z } from "zod";

export const customerFormSchema = z.object({
  warungId: z.string(),
  name: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});
