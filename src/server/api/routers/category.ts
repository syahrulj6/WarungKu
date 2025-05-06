import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  // Get all categories for the current warung
  getAllCategory: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    if (!user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    try {
      const categories = await db.category.findMany({
        where: { warungId: user.id },
        orderBy: { name: "asc" },
      });
      return categories;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch categories",
      });
    }
  }),

  // Create default categories if they don't exist
  createDefaultsCategory: privateProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    if (!user?.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not authenticated",
      });
    }

    const defaultCategories = ["Food", "Beverage", "Snack"];

    try {
      // Check which default categories don't exist yet
      const existingCategories = await db.category.findMany({
        where: {
          warungId: user.id,
          name: { in: defaultCategories },
        },
      });

      const existingNames = existingCategories.map((c) => c.name);
      const categoriesToCreate = defaultCategories
        .filter((name) => !existingNames.includes(name))
        .map((name) => ({ name, warungId: user.id }));

      if (categoriesToCreate.length > 0) {
        await db.category.createMany({
          data: categoriesToCreate,
        });
      }

      return { success: true, created: categoriesToCreate.length };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create default categories",
      });
    }
  }),

  // Create a custom category
  createCategory: privateProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(2, "Category name must be at least 2 characters")
          .max(50, "Category name cannot exceed 50 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      try {
        // Check if category already exists
        const existingCategory = await db.category.findFirst({
          where: {
            warungId: user.id,
            name: input.name,
          },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Category with this name already exists",
          });
        }

        const category = await db.category.create({
          data: {
            name: input.name,
            warungId: user.id,
          },
        });

        return category;
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create category",
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
          .min(2, "Category name must be at least 2 characters")
          .max(50, "Category name cannot exceed 50 characters"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
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
            message: "Another category with this name already exists",
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
          message: "Failed to update category",
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
          message: "User not authenticated",
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
            message: "Cannot delete category with associated products",
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
          message: "Failed to delete category",
        });
      }
    }),
});
