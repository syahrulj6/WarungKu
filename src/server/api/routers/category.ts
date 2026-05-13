import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  getAllCategory: privateProcedure
    .input(
      z.object({
        warungId: z.string(),
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
      const warung = await db.warung.findFirst({
        where: { id: input.warungId, ownerId: user.id },
        select: { id: true },
      });
      if (!warung) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Warung tidak ditemukan atau bukan milik Anda",
        });
      }

      const categories = await db.category.findMany({
        where: {
          warungId: warung.id,
        },
        orderBy: { name: "asc" },
      });

      return categories;
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

    const warung = await db.warung.findFirst({
      where: { id: input.warungId, ownerId: user.id },
      select: { id: true },
    });
    if (!warung) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Warung tidak ditemukan atau bukan milik Anda",
      });
    }

    const defaultCategories = ["Food", "Beverage", "Snack"];

    try {
      const existingCategories = await db.category.findMany({
        where: {
          warungId: warung.id,
          name: { in: defaultCategories },
        },
      });

      const existingNames = existingCategories.map((c) => c.name);
      const categoriesToCreate = defaultCategories
        .filter((name) => !existingNames.includes(name))
        .map((name) => ({ name, warungId: warung.id }));

      if (categoriesToCreate.length > 0) {
        await db.category.createMany({
          data: categoriesToCreate,
        });
      }

      return { success: true, created: categoriesToCreate.length };
    } catch (error) {
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

      const warung = await db.warung.findFirst({
        where: { id: input.warungId, ownerId: user.id },
        select: { id: true },
      });
      if (!warung) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Warung tidak ditemukan atau bukan milik Anda",
        });
      }

      try {
        // Check if category already exists
        const existingCategory = await db.category.findFirst({
          where: {
            warungId: warung.id,
            name: input.name,
          },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Kategori dengan nama tersebut sudah ada",
          });
        }

        const category = await db.category.create({
          data: {
            name: input.name,
            warungId: warung.id,
          },
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

      try {
        // Check if new name conflicts with another category
        const nameConflict = await db.category.findFirst({
          where: {
            warungId: user.id,
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
          where: {
            id: input.id,
            warungId: user.id,
          },
          data: {
            name: input.name,
          },
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

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Pengguna belum terautentikasi",
        });
      }

      try {
        // Check if category has any products
        const productsCount = await db.product.count({
          where: {
            categoryId: input.id,
            warungId: user.id,
          },
        });

        if (productsCount > 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Kategori tidak bisa dihapus karena masih dipakai produk",
          });
        }

        const deletedCategory = await db.category.delete({
          where: {
            id: input.id,
            warungId: user.id,
          },
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

