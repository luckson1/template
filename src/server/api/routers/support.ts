import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createTicketSchema,
  updateTicketSchema,
  getTicketByIdSchema,
  listTicketsSchema,
  createCommentSchema,
  createAttachmentSchema,
} from "../schemas/support.schema";
import { supportService } from "../services/support.service";

export const supportRouter = createTRPCRouter({
  // Create a new support ticket
  createTicket: protectedProcedure
    .input(createTicketSchema)
    .mutation(({ ctx, input }) => {
      return supportService.createTicket({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // Get a ticket by ID
  getTicketById: protectedProcedure
    .input(getTicketByIdSchema)
    .query(({ ctx, input }) => {
      return supportService.getTicketById({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // Update a ticket
  updateTicket: protectedProcedure
    .input(updateTicketSchema)
    .mutation(({ ctx, input }) => {
      return supportService.updateTicket({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // List tickets with filtering and pagination
  listTickets: protectedProcedure
    .input(listTicketsSchema)
    .query(({ ctx, input }) => {
      return supportService.listTickets({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // Add a comment to a ticket
  addComment: protectedProcedure
    .input(createCommentSchema)
    .mutation(({ ctx, input }) => {
      return supportService.addComment({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // Add an attachment to a ticket
  addAttachment: protectedProcedure
    .input(createAttachmentSchema)
    .mutation(({ ctx, input }) => {
      return supportService.addAttachment({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),

  // Delete a ticket (admin only)
  deleteTicket: protectedProcedure
    .input(getTicketByIdSchema)
    .mutation(({ ctx, input }) => {
      return supportService.deleteTicket({
        user: ctx.session.user,
        db: ctx.db,
        input,
      });
    }),
});
