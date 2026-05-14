import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { type PrismaClient } from "@prisma/client";
import { createSaleFormSchema } from "~/schemas/sale";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const saleRouter = createTRPCRouter({
  create: privateProcedure
    .input(createSaleFormSchema)
    .mutation(async ({ input, ctx }) => {
      const {
        warungId,
        customerId,
        paymentType,
        totalAmount,
        discountPercent,
        applyTax,
        taxPercent,
        notes,
        items,
      } = input;
      const { db, user } = ctx;

      const receiptNo = await generateReceiptNumber(db, warungId);
      const subTotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      const normalizedDiscountPercent = Math.max(0, discountPercent ?? 0);
      const normalizedTaxPercent = Math.max(0, taxPercent ?? 0);
      const discountAmount =
        Math.round(((subTotal * normalizedDiscountPercent) / 100) * 100) / 100;
      const dpp = Math.max(0, subTotal - discountAmount);
      const taxAmount = applyTax
        ? Math.round(((dpp * normalizedTaxPercent) / 100) * 100) / 100
        : 0;
      const calculatedTotal = dpp + taxAmount;

      if (Math.abs(totalAmount - calculatedTotal) > 0.01) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Total pesanan tidak valid.",
        });
      }

      const isPaid = paymentType === "CASH";

      const sale = await db.sale.create({
        data: {
          receiptNo,
          totalAmount: calculatedTotal,
          discount: discountAmount,
          tax: taxAmount,
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
          warung: true,
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
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
            amount: calculatedTotal,
            discount: discountAmount,
            discountPercent: normalizedDiscountPercent,
            dpp,
            tax: taxAmount,
            taxPercent: applyTax ? normalizedTaxPercent : 0,
            paymentType,
            itemsCount: items.length,
            status: isPaid ? "completed" : "on-process",
          },
        },
      });

      return sale;
    }),
  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { db, user } = ctx;

      const sale = await db.sale.findFirst({
        where: {
          id,
          warung: {
            ownerId: user?.id,
          },
        },
        include: {
          warung: true,
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!sale) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sale not found",
        });
      }

      return sale;
    }),

  getMetrics: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { warungId, startDate, endDate } = input;
      const { db } = ctx;

      const whereClause = {
        warungId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const [paidSales, orders, customers, products, unpaidSummary] =
        await Promise.all([
          db.sale.findMany({
            where: {
              ...whereClause,
              isPaid: true,
            },
            select: {
              totalAmount: true,
              items: {
                select: {
                  quantity: true,
                  product: {
                    select: {
                      costPrice: true,
                    },
                  },
                },
              },
            },
          }),
          db.sale.aggregate({
            where: whereClause,
            _count: { id: true },
            _sum: { totalAmount: true },
          }),
          db.customer.count({
            where: {
              warungId,
              ...(startDate &&
                endDate && {
                  createdAt: {
                    gte: startDate,
                    lte: endDate,
                  },
                }),
            },
          }),
          db.product.findMany({
            where: {
              warungId,
              isActive: true,
            },
            select: {
              stock: true,
              minStock: true,
            },
          }),
          db.sale.aggregate({
            where: {
              ...whereClause,
              isPaid: false,
            },
            _count: { id: true },
            _sum: { totalAmount: true },
          }),
        ]);

      const omzet = paidSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const modalTerjual = paidSales.reduce((sum, sale) => {
        const totalModalPerSale = sale.items.reduce((itemSum, item) => {
          return itemSum + item.quantity * (item.product?.costPrice ?? 0);
        }, 0);
        return sum + totalModalPerSale;
      }, 0);
      const labaKotor = omzet - modalTerjual;
      const lowStockCount = products.filter(
        (product) => product.stock <= (product.minStock ?? 5),
      ).length;

      const averageOrderValue =
        orders._count.id > 0
          ? (orders._sum.totalAmount ?? 0) / orders._count.id
          : 0;

      return {
        revenue: labaKotor,
        grossSales: omzet,
        cogs: modalTerjual,
        grossProfit: labaKotor,
        orders: orders._count.id,
        customers,
        lowStock: lowStockCount,
        unpaidOrders: unpaidSummary._count.id || 0,
        unpaidAmount: unpaidSummary._sum.totalAmount || 0,
        averageOrderValue,
      };
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
      } catch {
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
      } catch {
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
      } catch {
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
      } catch {
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
  getHistory: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        isPaid: z.boolean().default(true),
        searchTerm: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { warungId, isPaid, searchTerm, startDate, endDate } = input;
      const { db } = ctx;

      return db.sale.findMany({
        where: {
          warungId,
          isPaid,
          ...(searchTerm && {
            receiptNo: {
              contains: searchTerm,
              mode: "insensitive",
            },
          }),
          ...(startDate &&
            endDate && {
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }),
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
    }),
  getPaymentMethodSummary: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId, startDate, endDate } = input;

      const whereClause = {
        warungId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const sales = await db.sale.findMany({
        where: whereClause,
        select: {
          paymentType: true,
          totalAmount: true,
          isPaid: true,
        },
      });

      const grouped = sales.reduce<
        Record<
          string,
          {
            paymentType: string;
            totalAmount: number;
            orders: number;
            paidOrders: number;
          }
        >
      >((acc, sale) => {
        if (!acc[sale.paymentType]) {
          acc[sale.paymentType] = {
            paymentType: sale.paymentType,
            totalAmount: 0,
            orders: 0,
            paidOrders: 0,
          };
        }
        const paymentSummary = acc[sale.paymentType];
        if (!paymentSummary) return acc;
        paymentSummary.totalAmount += sale.totalAmount;
        paymentSummary.orders += 1;
        if (sale.isPaid) {
          paymentSummary.paidOrders += 1;
        }

        return acc;
      }, {});

      const summary = Object.values(grouped).sort(
        (a, b) => b.totalAmount - a.totalAmount,
      );
      const totalAmount = summary.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      );
      const totalOrders = summary.reduce((sum, item) => sum + item.orders, 0);

      return {
        summary,
        totalAmount,
        totalOrders,
      };
    }),
  getItemSalesSummary: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId, startDate, endDate } = input;

      const whereClause = {
        warungId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const sales = await db.sale.findMany({
        where: whereClause,
        select: {
          items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const grouped = sales
        .flatMap((sale) => sale.items)
        .reduce<
          Record<
            string,
            {
              productId: string;
              productName: string;
              quantity: number;
              grossSales: number;
              transactions: number;
              averagePrice: number;
            }
          >
        >((acc, item) => {
          const productId = item.product.id;
          const lineTotal = item.quantity * item.price;
          if (!acc[productId]) {
            acc[productId] = {
              productId,
              productName: item.product.name,
              quantity: 0,
              grossSales: 0,
              transactions: 0,
              averagePrice: 0,
            };
          }

          acc[productId].quantity += item.quantity;
          acc[productId].grossSales += lineTotal;
          acc[productId].transactions += 1;
          acc[productId].averagePrice =
            acc[productId].grossSales / acc[productId].quantity;

          return acc;
        }, {});

      const summary = Object.values(grouped).sort(
        (a, b) => b.grossSales - a.grossSales,
      );
      const totalGrossSales = summary.reduce(
        (sum, item) => sum + item.grossSales,
        0,
      );
      const totalQuantity = summary.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      return {
        summary,
        totalGrossSales,
        totalQuantity,
        totalItems: summary.length,
      };
    }),
  getCategorySalesSummary: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId, startDate, endDate } = input;

      const whereClause = {
        warungId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const sales = await db.sale.findMany({
        where: whereClause,
        select: {
          items: {
            select: {
              quantity: true,
              price: true,
              product: {
                select: {
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const grouped = sales
        .flatMap((sale) => sale.items)
        .reduce<
          Record<
            string,
            {
              categoryId: string;
              categoryName: string;
              quantity: number;
              grossSales: number;
              transactions: number;
              averagePrice: number;
            }
          >
        >((acc, item) => {
          const categoryId = item.product.category?.id ?? "uncategorized";
          const categoryName = item.product.category?.name ?? "Tanpa Kategori";
          const lineTotal = item.quantity * item.price;

          if (!acc[categoryId]) {
            acc[categoryId] = {
              categoryId,
              categoryName,
              quantity: 0,
              grossSales: 0,
              transactions: 0,
              averagePrice: 0,
            };
          }

          acc[categoryId].quantity += item.quantity;
          acc[categoryId].grossSales += lineTotal;
          acc[categoryId].transactions += 1;
          acc[categoryId].averagePrice =
            acc[categoryId].grossSales / acc[categoryId].quantity;

          return acc;
        }, {});

      const summary = Object.values(grouped).sort(
        (a, b) => b.grossSales - a.grossSales,
      );
      const totalGrossSales = summary.reduce(
        (sum, item) => sum + item.grossSales,
        0,
      );
      const totalQuantity = summary.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );

      return {
        summary,
        totalGrossSales,
        totalQuantity,
        totalCategories: summary.length,
      };
    }),
  getTaxSummary: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId, startDate, endDate } = input;

      const whereClause = {
        warungId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const sales = await db.sale.findMany({
        where: whereClause,
        select: {
          paymentType: true,
          totalAmount: true,
          tax: true,
        },
      });

      const grouped = sales.reduce<
        Record<
          string,
          {
            paymentType: string;
            orders: number;
            taxableSales: number;
            taxAmount: number;
            grossAfterTax: number;
            effectiveRate: number;
          }
        >
      >((acc, sale) => {
        if (!acc[sale.paymentType]) {
          acc[sale.paymentType] = {
            paymentType: sale.paymentType,
            orders: 0,
            taxableSales: 0,
            taxAmount: 0,
            grossAfterTax: 0,
            effectiveRate: 0,
          };
        }
        const taxSummary = acc[sale.paymentType];
        if (!taxSummary) return acc;
        taxSummary.orders += 1;
        taxSummary.grossAfterTax += sale.totalAmount;
        taxSummary.taxAmount += sale.tax;
        taxSummary.taxableSales += sale.totalAmount - sale.tax;

        return acc;
      }, {});

      const summary = Object.values(grouped)
        .map((item) => ({
          ...item,
          effectiveRate:
            item.taxableSales > 0
              ? (item.taxAmount / item.taxableSales) * 100
              : 0,
        }))
        .sort((a, b) => b.taxAmount - a.taxAmount);

      const totalOrders = summary.reduce((sum, item) => sum + item.orders, 0);
      const totalTaxableSales = summary.reduce(
        (sum, item) => sum + item.taxableSales,
        0,
      );
      const totalTaxAmount = summary.reduce(
        (sum, item) => sum + item.taxAmount,
        0,
      );
      const totalGrossAfterTax = summary.reduce(
        (sum, item) => sum + item.grossAfterTax,
        0,
      );
      const taxedOrders = sales.filter((sale) => sale.tax > 0).length;
      const overallEffectiveRate =
        totalTaxableSales > 0 ? (totalTaxAmount / totalTaxableSales) * 100 : 0;

      return {
        summary,
        totalOrders,
        taxedOrders,
        totalTaxableSales,
        totalTaxAmount,
        totalGrossAfterTax,
        overallEffectiveRate,
      };
    }),
  getDiscountSummary: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { warungId, startDate, endDate } = input;

      const whereClause = {
        warungId,
        ...(startDate &&
          endDate && {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
      };

      const sales = await db.sale.findMany({
        where: whereClause,
        select: {
          paymentType: true,
          totalAmount: true,
          tax: true,
          discount: true,
        },
      });

      const grouped = sales.reduce<
        Record<
          string,
          {
            paymentType: string;
            orders: number;
            grossBeforeDiscount: number;
            discountAmount: number;
            netBeforeTax: number;
            discountRate: number;
          }
        >
      >((acc, sale) => {
        const grossBeforeDiscount = sale.totalAmount - sale.tax + sale.discount;
        const netBeforeTax = sale.totalAmount - sale.tax;

        if (!acc[sale.paymentType]) {
          acc[sale.paymentType] = {
            paymentType: sale.paymentType,
            orders: 0,
            grossBeforeDiscount: 0,
            discountAmount: 0,
            netBeforeTax: 0,
            discountRate: 0,
          };
        }
        const discountSummary = acc[sale.paymentType];
        if (!discountSummary) return acc;
        discountSummary.orders += 1;
        discountSummary.grossBeforeDiscount += grossBeforeDiscount;
        discountSummary.discountAmount += sale.discount;
        discountSummary.netBeforeTax += netBeforeTax;
        return acc;
      }, {});

      const summary = Object.values(grouped)
        .map((item) => ({
          ...item,
          discountRate:
            item.grossBeforeDiscount > 0
              ? (item.discountAmount / item.grossBeforeDiscount) * 100
              : 0,
        }))
        .sort((a, b) => b.discountAmount - a.discountAmount);

      const totalOrders = summary.reduce((sum, item) => sum + item.orders, 0);
      const discountedOrders = sales.filter((sale) => sale.discount > 0).length;
      const totalGrossBeforeDiscount = summary.reduce(
        (sum, item) => sum + item.grossBeforeDiscount,
        0,
      );
      const totalDiscountAmount = summary.reduce(
        (sum, item) => sum + item.discountAmount,
        0,
      );
      const totalNetBeforeTax = summary.reduce(
        (sum, item) => sum + item.netBeforeTax,
        0,
      );
      const overallDiscountRate =
        totalGrossBeforeDiscount > 0
          ? (totalDiscountAmount / totalGrossBeforeDiscount) * 100
          : 0;

      return {
        summary,
        totalOrders,
        discountedOrders,
        totalGrossBeforeDiscount,
        totalDiscountAmount,
        totalNetBeforeTax,
        overallDiscountRate,
      };
    }),
});

async function generateReceiptNumber(prisma: PrismaClient, warungId: string) {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0]?.replace(/-/g, "") ?? "";
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
