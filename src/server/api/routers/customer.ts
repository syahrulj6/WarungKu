import { z } from "zod";
import { customerFormSchema } from "~/schemas/customer";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const customerRouter = createTRPCRouter({
  getAll: privateProcedure
    .input(z.object({ warungId: z.string() }))
    .query(({ ctx, input }) => {
      const { db } = ctx;

      const { warungId } = input;

      return db.customer.findMany({
        where: {
          warungId: warungId,
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  create: privateProcedure
    .input(customerFormSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { name, warungId, address, email, phone } = input;

      const customer = await db.customer.create({
        data: {
          name: name,
          phone: phone,
          address: address,
          email: email,
          warung: { connect: { id: warungId } },
        },
      });

      // Create activity log
      await db.warungActivity.create({
        data: {
          type: "CUSTOMER_ADDED",
          description: `Customer ${input.name} added`,
          warung: { connect: { id: input.warungId } },
          user: { connect: { id: user?.id } },
          relatedCustomer: { connect: { id: customer.id } },
        },
      });

      return customer;
    }),
});
