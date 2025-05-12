import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";
import { createSaleFormSchema } from "~/schemas/sale";
import { z } from "zod";

export const saleRouter = createTRPCRouter({
  create: privateProcedure
    .input(createSaleFormSchema)
    .mutation(async ({ input, ctx }) => {
      const { warungId, customerId, paymentType, totalAmount, notes, items } =
        input;
      const { db, user } = ctx;

      const receiptNo = await generateReceiptNumber(db, warungId);

      const isPaid = paymentType === "CASH";

      const sale = await db.sale.create({
        data: {
          receiptNo,
          totalAmount,
          paymentType,
          notes,
          isPaid: isPaid,
          warung: { connect: { id: warungId } },
          customer: customerId ? { connect: { id: customerId } } : undefined,
          user: { connect: { id: user?.id } },
          items: {
            create: items.map((item) => ({
              quantity: item.quantity,
              price: item.price,
              product: { connect: { id: item.productId } },
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await Promise.all(
        items.map(async (item) => {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }),
      );

      await db.warungActivity.create({
        data: {
          type: "SALE_CREATED",
          description: `Sale ${receiptNo} created`,
          warung: { connect: { id: warungId } },
          user: { connect: { id: user?.id } },
          relatedSale: { connect: { id: sale.id } },
          metadata: {
            amount: totalAmount,
            paymentType,
            itemsCount: items.length,
            status: isPaid ? "completed" : "on-process",
          },
        },
      });

      return sale;
    }),

  getByStatus: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        isPaid: z.boolean(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { warungId, isPaid } = input;

      return ctx.db.sale.findMany({
        where: {
          warungId,
          isPaid,
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  markAsPaid: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const { db, user } = ctx;

      const sale = await db.sale.update({
        where: { id },
        data: {
          isPaid: true,
        },
        include: {
          customer: true,
        },
      });

      await db.warungActivity.create({
        data: {
          type: "SALE_UPDATED",
          description: `Sale ${sale.receiptNo} marked as paid`,
          warung: { connect: { id: sale.warungId } },
          user: { connect: { id: user?.id } },
          relatedSale: { connect: { id: sale.id } },
          metadata: {
            amount: sale.totalAmount,
            previousStatus: "unpaid",
            newStatus: "paid",
          },
        },
      });

      return sale;
    }),
});

async function generateReceiptNumber(prisma: PrismaClient, warungId: string) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]!.replace(/-/g, "");
  const count = await prisma.sale.count({
    where: {
      warungId,
      createdAt: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  return `INV-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;
}
