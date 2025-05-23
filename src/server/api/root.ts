import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "./routers/auth";
import { profileRouter } from "./routers/profile";
import { warungRouter } from "./routers/warung";
import { securityRouter } from "./routers/security";
import { productRouter } from "./routers/product";
import { categoryRouter } from "./routers/category";
import { saleRouter } from "./routers/sale";
import { customerRouter } from "./routers/customer";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  profile: profileRouter,
  warung: warungRouter,
  security: securityRouter,
  product: productRouter,
  category: categoryRouter,
  sale: saleRouter,
  customer: customerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
