import { z } from "zod";

export const createSaleFormSchema = z.object({
  warungId: z.string(),
  customerId: z.string().nullable(),
  paymentType: z.enum(["CASH", "QRIS", "BANK_TRANSFER", "E_WALLET", "DEBT"]),
  totalAmount: z.number(),
  notes: z.string().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    }),
  ),
});
