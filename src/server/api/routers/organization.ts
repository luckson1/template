import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createOrganizationSchema,
  getOrganizationByIdSchema,
  getUserOrganizationsSchema,
  addUserToOrganizationSchema,
  updateOrganizationSchema,
} from "../schemas/organization.schema";
import { organizationService } from "../services/organization.service";

export const organizationRouter = createTRPCRouter({
  getUserOrganizations: protectedProcedure
    .input(getUserOrganizationsSchema)
    .query(({ ctx, input }) => {
      // Extract user from session and pass db directly
      return organizationService.getUserOrganizations({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  getOrganizationById: protectedProcedure
    .input(getOrganizationByIdSchema)
    .query(({ ctx, input }) => {
      // Extract user from session and pass db directly
      return organizationService.getById({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(({ ctx, input }) => {
      // Extract user from session and pass db directly
      return organizationService.create({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  update: protectedProcedure
    .input(updateOrganizationSchema)
    .mutation(({ ctx, input }) => {
      // Extract user from session and pass db directly
      return organizationService.update({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  addUserToOrganization: protectedProcedure
    .input(addUserToOrganizationSchema)
    .mutation(({ ctx, input }) => {
      // Extract user from session and pass db directly
      return organizationService.addUserToOrganization({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),
});
