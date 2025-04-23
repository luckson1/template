import { z } from "zod";
import {
  createTRPCRouter,
  orgProtectedProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { organizationService } from "../services/organization";
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationByIdSchema,
  getOrganizationBySlugSchema,
  getUserOrganizationsSchema,
  addUserToOrganizationSchema,
  deleteOrganizationSchema,
  inviteUserSchema,
  acceptInvitationSchema,
  revokeInvitationSchema,
  removeUserSchema,
  updateUserRoleSchema,
  setDefaultOrganizationSchema,
  getInvitationByTokenSchema,
  rejectInvitationSchema,
} from "../schemas/organization.schema";

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
    .input(deleteOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.delete({
        user: ctx.session.user,
        db: ctx.db,
        id: input.id,
      });
    }),

  invite: orgProtectedProcedure
    .input(inviteUserSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.invite({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: ctx.organizationId,
        email: input.email,
        role: input.role,
      });
    }),

  acceptInvitation: protectedProcedure
    .input(acceptInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.acceptInvitation({
        user: ctx.session.user,
        db: ctx.db,
        token: input.token,
      });
    }),

  revokeInvitation: protectedProcedure
    .input(revokeInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.revokeInvitation({
        user: ctx.session.user,
        db: ctx.db,
        id: input.id,
      });
    }),

  removeUser: orgProtectedProcedure
    .input(removeUserSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.removeUser({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: ctx.organizationId,
        userId: input.userId,
      });
    }),

  updateUserRole: orgProtectedProcedure
    .input(updateUserRoleSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.updateUserRole({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: ctx.organizationId,
        userId: input.userId,
        role: input.role,
      });
    }),

  setDefaultOrganization: protectedProcedure
    .input(setDefaultOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.setDefaultOrganization({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: input.organizationId,
      });
    }),

  getMembers: orgProtectedProcedure.query(async ({ ctx }) => {
    return organizationService.getMembers({
      user: ctx.session.user,
      db: ctx.db,
      organizationId: ctx.organizationId,
    });
  }),

  getPendingInvitations: orgProtectedProcedure.query(async ({ ctx }) => {
    return organizationService.getPendingInvitations({
      user: ctx.session.user,
      db: ctx.db,
      organizationId: ctx.organizationId,
    });
  }),

  addUser: orgProtectedProcedure
    .input(addUserToOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.addUser({
        user: ctx.session.user,
        db: ctx.db,
        organizationId: ctx.organizationId,
        input,
      });
    }),

  getInvitationByToken: publicProcedure
    .input(getInvitationByTokenSchema)
    .query(async ({ ctx, input }) => {
      return organizationService.getInvitationByToken({
        db: ctx.db,
        token: input.token,
      });
    }),

  rejectInvitation: protectedProcedure
    .input(rejectInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return organizationService.rejectInvitation({
        user: ctx.session.user,
        db: ctx.db,
        token: input.token,
      });
    }),
});
