/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { readSessionUserId } from "~/lib/auth/server";
import { type User } from "@prisma/client";
import type { WarungStaffRole } from "@prisma/client";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = {
  user: User | null;
  req: CreateNextContextOptions["req"];
  res: CreateNextContextOptions["res"];
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (_opts: CreateContextOptions) => {
  return {
    db,
    user: _opts.user,
    req: _opts.req,
    res: _opts.res,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (_opts: CreateNextContextOptions) => {
  const userId = readSessionUserId(_opts.req.headers.cookie);
  const user = userId
    ? await db.user.findUnique({ where: { id: userId } })
    : null;

  return createInnerTRPCContext({
    req: _opts.req,
    res: _opts.res,
    user,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

// Simple in-memory rate limiter. Suitable for single-instance deployments.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = process.env.NODE_ENV === "production" ? 60 : 120; // tighter in prod

const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const forwarded = ctx.req.headers["x-forwarded-for"] as string | undefined;
  const forwardedIp = forwarded?.split(",")[0]?.trim();
  const ip = forwardedIp || ctx.req.socket?.remoteAddress || "unknown";

  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
    rateLimitStore.set(ip, entry);

    if (entry.count > RATE_LIMIT_MAX) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
      });
    }
  }

  return await next();
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "user unauthorized" });

  return await next();
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(timingMiddleware);

export const privateProcedure = t.procedure
  .use(rateLimitMiddleware)
  .use(authMiddleware);

/**
 * Role-based procedure factory. Use like: `export const managerProcedure = roleProcedure('MANAGER');`
 */
export const roleProcedure = (role: WarungStaffRole) =>
  t.procedure.use(async ({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const hasRole = await ctx.db.warungStaff.findFirst({
      where: { userId: ctx.user.id, role },
    });

    if (!hasRole) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Insufficient role" });
    }

    return await next();
  });
