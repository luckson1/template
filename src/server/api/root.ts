import { organizationRouter } from "@/server/api/routers/organization";
import { userRouter } from "@/server/api/routers/user";
import { supportRouter } from "@/server/api/routers/support";
import { ticketRouter } from "@/server/api/routers/ticket";
import { adminRouter } from "@/server/api/routers/admin";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  user: userRouter,
  support: supportRouter,
  ticket: ticketRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const result = await trpc.post.all();
 */
export const createCaller = createCallerFactory(appRouter);
