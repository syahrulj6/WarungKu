import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";
import {
  assertManagerOrOwner,
  assertStaffOrAbove,
  getAuthorizedWarungIds,
} from "~/server/api/utils/roles";

export const categoryRouter = createTRPCRouter({
  getAllCategory: privateProcedure
    .input(
      z.object({
        warungId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Pengguna belum terautentikasi",
        });
      }

      try {
        if (input.warungId) {
          await assertStaffOrAbove(db, input.warungId, user.id);
          return await db.category.findMany({
            where: { warungId: input.warungId },
            orderBy: { name: "asc" },
          });
        }

        const authorizedWarungIds = await getAuthorizedWarungIds(db, user.id);

        if (authorizedWarungIds.length === 0) return [];

        return await db.category.findMany({
          where: { warungId: { in: authorizedWarungIds } },
          orderBy: { name: "asc" },
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal mengambil kategori",
        });
      }
    }),

  createDefaultsCategory: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Pengguna belum terautentikasi",
        });
      }

      await assertManagerOrOwner(db, input.warungId, user.id);

      const defaultCategories = ["Food", "Beverage", "Snack"];

      try {
        const existingCategories = await db.category.findMany({
          where: { warungId: input.warungId, name: { in: defaultCategories } },
        });

        const existingNames = existingCategories.map((c) => c.name);
        const categoriesToCreate = defaultCategories
          .filter((name) => !existingNames.includes(name))
          .map((name) => ({ name, warungId: input.warungId }));

        if (categoriesToCreate.length > 0) {
          await db.category.createMany({ data: categoriesToCreate });
        }

        return { success: true, created: categoriesToCreate.length };
      } catch {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal membuat kategori default",
        });
      }
    }),

  createCategory: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
        name: z
          .string()
          .min(2, "Nama kategori minimal 2 karakter")
          .max(50, "Nama kategori maksimal 50 karakter"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Pengguna belum terautentikasi",
        });
      }

      await assertManagerOrOwner(db, input.warungId, user.id);

      try {
        // Check if category already exists
        const existingCategory = await db.category.findFirst({
          where: { warungId: input.warungId, name: input.name },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Kategori dengan nama tersebut sudah ada",
          });
        }

        const category = await db.category.create({
          data: { name: input.name, warungId: input.warungId },
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal membuat kategori",
        });
      }
    }),

  // Update a category
  updateCategory: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(2, "Nama kategori minimal 2 karakter")
          .max(50, "Nama kategori maksimal 50 karakter"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Pengguna belum terautentikasi",
        });
      }

      // find category to get warungId
      const category = await db.category.findUnique({
        where: { id: input.id },
        select: { warungId: true },
      });
      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori tidak ditemukan",
        });

      await assertManagerOrOwner(db, category.warungId, user.id);

      try {
        // Check if new name conflicts with another category
        const nameConflict = await db.category.findFirst({
          where: {
            warungId: category.warungId,
            name: input.name,
            NOT: { id: input.id },
          },
        });

        if (nameConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Nama kategori sudah digunakan kategori lain",
          });
        }

        const updatedCategory = await db.category.update({
          where: { id: input.id },
          data: { name: input.name },
        });

        return updatedCategory;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal memperbarui kategori",
        });
      }
    }),

  // Delete a category (only if no products are associated)
  deleteCategory: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      if (!user?.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Pengguna belum terautentikasi",
        });

      // find category to get warungId
      const category = await db.category.findUnique({
        where: { id: input.id },
        select: { warungId: true },
      });
      if (!category)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Kategori tidak ditemukan",
        });

      await assertManagerOrOwner(db, category.warungId, user.id);

      try {
        // Check if category has any products
        const productsCount = await db.product.count({
          where: { categoryId: input.id, warungId: category.warungId },
        });

        if (productsCount > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Kategori tidak bisa dihapus karena masih dipakai produk",
          });
        }

        const deletedCategory = await db.category.delete({
          where: { id: input.id },
        });

        return deletedCategory;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal menghapus kategori",
        });
      }
    }),
});
