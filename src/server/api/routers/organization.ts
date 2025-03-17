import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { organizationService } from "../services/organization";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationByIdSchema,
  getOrganizationBySlugSchema,
  getUserOrganizationsSchema,
  addUserToOrganizationSchema,
} from "../schemas/organization.schema";
import { OrganizationRole } from "@prisma/client";

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.create({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  getById: protectedProcedure
    .input(getOrganizationByIdSchema)
    .query(async ({ ctx, input }) => {
      return organizationService.getById({
        user: ctx.session.user,
        db: ctx.db,
        id: input.id,
      });
    }),

  getBySlug: protectedProcedure
    .input(getOrganizationBySlugSchema)
    .query(async ({ ctx, input }) => {
      return organizationService.getBySlug({
        user: ctx.session.user,
        db: ctx.db,
        slug: input.slug,
      });
    }),

  getUserOrganizations: protectedProcedure
    .input(getUserOrganizationsSchema.optional())
    .query(async ({ ctx }) => {
      return organizationService.getUserOrganizations({
        user: ctx.session.user,
        db: ctx.db,
      });
    }),

  update: protectedProcedure
    .input(updateOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.update({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return organizationService.delete({
        user: ctx.session.user,
        db: ctx.db,
        id: input.id,
      });
    }),

  invite: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        email: z.string().email("Invalid email format"),
        role: z.nativeEnum(OrganizationRole).default(OrganizationRole.MEMBER),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return organizationService.invite({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
        email: input.email,
        role: input.role,
      });
    }),

  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return organizationService.acceptInvitation({
        user: ctx.session.user,
        db: ctx.db,
        token: input.token,
      });
    }),

  revokeInvitation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return organizationService.revokeInvitation({
        user: ctx.session.user,
        db: ctx.db,
        id: input.id,
      });
    }),

  removeUser: protectedProcedure
    .input(z.object({ organizationId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return organizationService.removeUser({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
        userId: input.userId,
      });
    }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(OrganizationRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return organizationService.updateUserRole({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
        userId: input.userId,
        role: input.role,
      });
    }),

  setDefaultOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return organizationService.setDefaultOrganization({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
      });
    }),

  getMembers: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return organizationService.getMembers({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
      });
    }),

  getPendingInvitations: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return organizationService.getPendingInvitations({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
      });
    }),

  // Add user to organization (for testing purposes)
  addUser: protectedProcedure
    .input(addUserToOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const { organizationId, userId, role } = input;
      const targetUserId = userId ?? ctx.session.user.id;

      // Check if user is already a member
      const existingMembership = await ctx.db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: targetUserId,
            organizationId,
          },
        },
      });

      if (existingMembership) {
        return { success: false, message: "User is already a member" };
      }

      // Add user to organization
      await ctx.db.userOrganization.create({
        data: {
          userId: targetUserId,
          organizationId,
          role: role as OrganizationRole,
        },
      });

      return { success: true };
    }),

  // Add a new endpoint for getting invitation details by token
  getInvitationByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return organizationService.getInvitationByToken({
        db: ctx.db,
        token: input.token,
      });
    }),
});
