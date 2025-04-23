/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import superjson from "superjson";
import { ZodError } from "zod";

import { env } from "@/env";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

// Initialize Upstash Redis client
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Initialize Rate Limiter (e.g., 10 requests per 1 seconds per IP)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  analytics: true,
  prefix: "trpc-ratelimit",
});

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();
  // Extract the organization ID from the headers
  const organizationId = opts.headers.get("X-Organization-Id");
  // Extract IP address
  const ip =
    opts.headers.get("x-forwarded-for") ??
    opts.headers.get("x-real-ip") ??
    null;

  return {
    db,
    session,
    // Add the organization ID to the context
    organizationId: organizationId ?? null,
    ip, // Add IP address to context
    ...opts, // Spread remaining opts if needed
  };
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

/**
 * Middleware for IP-based rate limiting.
 */
const rateLimitMiddleware = t.middleware(async ({ ctx, next }) => {
  const ip = ctx.ip;
  const userId = ctx.session?.user?.id;

  // Determine the identifier for rate limiting
  let identifier: string | null = null;
  if (ip) {
    identifier = ip;
  } else if (userId) {
    // Use userId as fallback only for authenticated users if IP is missing
    identifier = userId;
  }

  // If no identifier could be determined (neither IP nor logged-in user), block the request.
  if (!identifier) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Could not determine identifier for rate limiting (IP or User ID).",
    });
  }

  // Perform rate limiting using the determined identifier
  const { success, limit, remaining, reset } =
    await ratelimit.limit(identifier);

  if (!success) {
    const resetDate = new Date(reset);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again after ${resetDate.toLocaleTimeString()}.`,
      // Optionally include limit details in the error's data field
      // data: { limit, remaining, reset },
    });
  }

  return next({
    ctx: {
      rateLimit: { limit, remaining, reset },
      ...ctx,
    },
  });
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  .use(timingMiddleware)
  .use(rateLimitMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user?.id) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    console.log(
      "organizationId",
      ctx.organizationId,
      "organizationId from headers",
      ctx.headers.get("X-Organization-Id"),
    );
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    });
  });

/**
 * Middleware to ensure organizationId is present in the context
 * AND the authenticated user is a member of that organization.
 */
const orgMiddleware = t.middleware(async ({ ctx, next }) => {
  // 1. Check if organizationId is present
  if (!ctx.organizationId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Organization ID header (X-Organization-Id) is required.",
    });
  }

  // 2. Check if user is authenticated (should be guaranteed by protectedProcedure before this)
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // 3. Check if the authenticated user is a member of the specified organization
  try {
    const membership = await ctx.db.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: ctx.session.user.id,
          organizationId: ctx.organizationId,
        },
      },
      select: { role: true }, // Select only necessary field(s)
    });

    if (!membership) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User is not a member of the specified organization.",
      });
    }

    // If membership exists, proceed. Optionally add role to context if needed later:
    // ctx.organizationRole = membership.role;
  } catch (error) {
    // Handle potential database errors
    if (error instanceof TRPCError) throw error; // Re-throw known TRPC errors
    console.error("Database error checking organization membership:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to verify organization membership.",
    });
  }

  // Refine the context to guarantee organizationId is non-null (already done conceptually)
  return next({
    ctx: {
      ...ctx,
      organizationId: ctx.organizationId,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Organization Protected (authenticated and organization-scoped) procedure
 * Ensures the user is logged in, an organization ID is provided via header,
 * AND the user is a member of that organization.
 * Guarantees `ctx.session.user` and `ctx.organizationId` are not null.
 */
export const orgProtectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(orgMiddleware);
