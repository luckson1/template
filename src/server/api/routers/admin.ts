import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { SystemRole } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { isSystemAdmin } from "@/lib/system-roles";

export const adminRouter = createTRPCRouter({
  /**
   * Get all users with their system roles
   */
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    // Check if the current user is a system admin
    if (!isSystemAdmin(ctx.session.user)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only system administrators can access this resource",
      });
    }

    return ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        systemRole: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  /**
   * Update a user's system role
   */
  updateUserSystemRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        systemRole: z.nativeEnum(SystemRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if the current user is a system admin
      if (!isSystemAdmin(ctx.session.user)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system administrators can update system roles",
        });
      }

      // Prevent changing your own role (to avoid locking yourself out)
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change your own system role",
        });
      }

      return ctx.db.user.update({
        where: { id: input.userId },
        data: { systemRole: input.systemRole },
        select: {
          id: true,
          name: true,
          email: true,
          systemRole: true,
        },
      });
    }),
});
