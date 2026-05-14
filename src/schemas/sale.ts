import { z } from "zod";

export const createSaleFormSchema = z.object({
  warungId: z.string(),
  customerId: z.string().nullable(),
  paymentType: z.enum(["CASH", "QRIS", "BANK_TRANSFER", "E_WALLET", "DEBT"]),
  totalAmount: z.number(),
  discountPercent: z.number().min(0).max(100).default(0),
  applyTax: z.boolean().default(false),
  taxPercent: z.number().min(0).max(100).default(11),
  notes: z.string().nullable(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    }),
  ),
});

