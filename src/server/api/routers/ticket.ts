import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  getAllTicketsSchema,
  getTicketByIdSchema,
  getTicketCommentsSchema,
  addTicketCommentSchema,
  updateTicketStatusSchema,
  editTicketCommentSchema,
  deleteTicketCommentSchema,
} from "../schemas/ticket";
import { ticketService } from "../services/ticket";

export const ticketRouter = createTRPCRouter({
  // Get all tickets with filtering, sorting, and pagination
  getAll: protectedProcedure
    .input(getAllTicketsSchema)
    .query(({ ctx, input }) => {
      return ticketService.getAll({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),

  // Get a single ticket by ID
  getById: protectedProcedure
    .input(getTicketByIdSchema)
    .query(({ ctx, input }) => {
      return ticketService.getById({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),

  // Get comments for a ticket
  getComments: protectedProcedure
    .input(getTicketCommentsSchema)
    .query(({ ctx, input }) => {
      return ticketService.getComments({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),

  // Add a comment to a ticket
  addComment: protectedProcedure
    .input(addTicketCommentSchema)
    .mutation(({ ctx, input }) => {
      return ticketService.addComment({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),

  // Edit a comment
  editComment: protectedProcedure
    .input(editTicketCommentSchema)
    .mutation(({ ctx, input }) => {
      return ticketService.editComment({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),

  // Delete a comment
  deleteComment: protectedProcedure
    .input(deleteTicketCommentSchema)
    .mutation(({ ctx, input }) => {
      return ticketService.deleteComment({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),

  // Update ticket status
  updateStatus: protectedProcedure
    .input(updateTicketStatusSchema)
    .mutation(({ ctx, input }) => {
      return ticketService.updateStatus({
        user: ctx.session.user ?? null,
        db: ctx.db,
        input,
      });
    }),
});
