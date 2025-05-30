import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";
import { createSaleFormSchema } from "~/schemas/sale";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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

  getAllCompletedSale: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        isPaid: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId, isPaid } = input;

      try {
        const sale = await db.sale.findMany({
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
          orderBy: {
            createdAt: "desc",
          },
        });

        return sale;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sale",
        });
      }
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
      const { db } = ctx;

      try {
        const sale = await db.sale.findMany({
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

        return sale;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sale",
        });
      }
    }),

  getSaleByDate: privateProcedure
    .input(
      z.object({
        date: z.date(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { date } = input;

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      try {
        const sale = await db.sale.findMany({
          where: {
            AND: [
              {
                warung: {
                  ownerId: user?.id,
                },
              },
              {
                createdAt: {
                  gte: startOfDay,
                  lte: endOfDay,
                },
              },
            ],
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return sale;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sale",
        });
      }
    }),

  searchSaleByReceiptNumber: privateProcedure
    .input(
      z.object({
        receiptNumber: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { receiptNumber } = input;

      try {
        const sale = await db.sale.findMany({
          where: {
            AND: [
              {
                warung: {
                  ownerId: user?.id,
                },
              },
              {
                receiptNo: {
                  contains: receiptNumber,
                  mode: "insensitive",
                },
              },
            ],
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        return sale;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch sale",
        });
      }
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

  getMonthlyMetrics: privateProcedure
    .input(z.object({ warungId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId } = input;

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
      );

      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [currentRevenue, currentOrders, currentCustomers] =
        await Promise.all([
          db.sale.aggregate({
            where: {
              warungId,
              isPaid: true,
              createdAt: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
              },
            },
            _sum: {
              totalAmount: true,
            },
          }),

          db.sale.count({
            where: {
              warungId,
              createdAt: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
              },
            },
          }),

          db.customer.count({
            where: {
              warungId,
              createdAt: {
                gte: currentMonthStart,
                lte: currentMonthEnd,
              },
            },
          }),
        ]);

      const [prevRevenue, prevOrders, prevCustomers] = await Promise.all([
        db.sale.aggregate({
          where: {
            warungId,
            isPaid: true,
            createdAt: {
              gte: prevMonthStart,
              lte: prevMonthEnd,
            },
          },
          _sum: {
            totalAmount: true,
          },
        }),
        db.sale.count({
          where: {
            warungId,
            createdAt: {
              gte: prevMonthStart,
              lte: prevMonthEnd,
            },
          },
        }),
        db.customer.count({
          where: {
            warungId,
            createdAt: {
              gte: prevMonthStart,
              lte: prevMonthEnd,
            },
          },
        }),
      ]);

      const lowStockProducts = await db.product.count({
        where: {
          warungId,
          stock: {
            lt: 5,
          },
          isActive: true,
        },
      });

      const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return 100;
        return ((current - previous) / previous) * 100;
      };

      return {
        revenue: {
          current: currentRevenue._sum.totalAmount || 0,
          previous: prevRevenue._sum.totalAmount || 0,
          change: calculatePercentageChange(
            currentRevenue._sum.totalAmount || 0,
            prevRevenue._sum.totalAmount || 0,
          ),
        },
        orders: {
          current: currentOrders,
          previous: prevOrders,
          change: calculatePercentageChange(currentOrders, prevOrders),
        },
        customers: {
          current: currentCustomers,
          previous: prevCustomers,
          change: calculatePercentageChange(currentCustomers, prevCustomers),
        },
        lowStock: lowStockProducts,
      };
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
