import { z } from "zod";
import { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

// Base schema for support tickets
export const supportTicketSchema = z.object({
  id: z.string().cuid().optional(),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters")
    .max(100, "Subject cannot exceed 100 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  category: z.nativeEnum(TicketCategory),
  priority: z.nativeEnum(TicketPriority),
  status: z.nativeEnum(TicketStatus).optional(),
  organizationId: z.string().cuid(),
  assigneeId: z.string().cuid().optional(),
});

// Schema for creating a new ticket
export const createTicketSchema = supportTicketSchema.omit({
  id: true,
  status: true,
  assigneeId: true,
});

// Schema for updating a ticket
export const updateTicketSchema = z.object({
  id: z.string().cuid(),
  subject: z.string().min(3).max(100).optional(),
  message: z.string().min(10).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  assigneeId: z.string().cuid().optional().nullable(),
});

// Schema for getting a ticket by ID
export const getTicketByIdSchema = z.object({
  id: z.string().cuid(),
});

// Schema for listing tickets with filtering and pagination
export const listTicketsSchema = z.object({
  status: z.nativeEnum(TicketStatus).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  organizationId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
});

// Schema for ticket comments
export const ticketCommentSchema = z.object({
  id: z.string().cuid().optional(),
  message: z.string().min(1, "Comment cannot be empty"),
  isInternal: z.boolean().default(false),
  ticketId: z.string().cuid(),
});

// Schema for creating a new comment
export const createCommentSchema = ticketCommentSchema.omit({
  id: true,
});

// Schema for ticket attachments
export const ticketAttachmentSchema = z.object({
  id: z.string().cuid().optional(),
  fileName: z.string(),
  fileSize: z.number().positive(),
  fileType: z.string(),
  fileUrl: z.string().url(),
  ticketId: z.string().cuid(),
});

// Schema for creating a new attachment
export const createAttachmentSchema = ticketAttachmentSchema.omit({
  id: true,
});

// Export types
export type ISupportTicket = z.infer<typeof supportTicketSchema>;
export type ICreateTicket = z.infer<typeof createTicketSchema>;
export type IUpdateTicket = z.infer<typeof updateTicketSchema>;
export type IListTickets = z.infer<typeof listTicketsSchema>;
export type ITicketComment = z.infer<typeof ticketCommentSchema>;
export type ICreateComment = z.infer<typeof createCommentSchema>;
export type ITicketAttachment = z.infer<typeof ticketAttachmentSchema>;
export type ICreateAttachment = z.infer<typeof createAttachmentSchema>;
