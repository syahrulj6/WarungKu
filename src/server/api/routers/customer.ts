import { z } from "zod";
import { customerFormSchema } from "~/schemas/customer";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import {
  assertManagerOrOwner,
  getAuthorizedWarungIds,
} from "~/server/api/utils/roles";

export const customerRouter = createTRPCRouter({
  getAll: privateProcedure
    .input(z.object({ warungId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { warungId } = input;

      if (!user?.id) return [];

      if (warungId) {
        await assertManagerOrOwner(db, warungId, user.id);

        return db.customer.findMany({
          where: { warungId, isActive: true },
          orderBy: { name: "asc" },
        });
      }

      const authorizedWarungIds = await getAuthorizedWarungIds(db, user.id);
      if (authorizedWarungIds.length === 0) return [];

      return db.customer.findMany({
        where: { warungId: { in: authorizedWarungIds }, isActive: true },
        orderBy: { name: "asc" },
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
