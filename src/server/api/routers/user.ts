import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { userService } from "@/server/api/services/user";
import {
  getUserByIdSchema,
  updateUserProfileSchema,
} from "@/server/api/schemas/user.schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  // Get current user profile
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          organizations: {
            include: {
              organization: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user profile",
      });
    }
  }),

  // Get user by ID
  getById: protectedProcedure
    .input(getUserByIdSchema)
    .query(({ ctx, input }) => {
      return userService.getById({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(updateUserProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure user can only update their own profile
        if (input.id && input.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only update your own profile",
          });
        }

        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            name: input.name,
            image: input.image,
            defaultOrganizationId: input.defaultOrganizationId,
          },
        });

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
        });
      }
    }),

  // Get user's organizations
  getUserOrganizations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userOrgs = await ctx.db.userOrganization.findMany({
        where: { userId: ctx.session.user.id },
        include: {
          organization: true,
        },
      });

      return userOrgs;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user organizations",
      });
    }
  }),

  // Set default organization
  setDefaultOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify user belongs to this organization
        const userOrg = await ctx.db.userOrganization.findUnique({
          where: {
            userId_organizationId: {
              userId: ctx.session.user.id,
              organizationId: input.organizationId,
            },
          },
        });

        if (!userOrg) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't belong to this organization",
          });
        }

        // Update user's default organization
        const updatedUser = await ctx.db.user.update({
          where: { id: ctx.session.user.id },
          data: {
            defaultOrganizationId: input.organizationId,
          },
        });

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to set default organization",
        });
      }
    }),
});
