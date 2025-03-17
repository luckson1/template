import { z } from "zod";
import { TicketCategory, TicketPriority, TicketStatus } from "@prisma/client";

// Schema for getting all tickets with filtering, sorting, and pagination
export const getAllTicketsSchema = z.object({
  organizationId: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  status: z.nativeEnum(TicketStatus).optional(),
  priority: z.nativeEnum(TicketPriority).optional(),
  category: z.nativeEnum(TicketCategory).optional(),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

// Schema for getting a ticket by ID
export const getTicketByIdSchema = z.object({
  id: z.string(),
});

// Schema for getting comments for a ticket
export const getTicketCommentsSchema = z.object({
  ticketId: z.string(),
});

// Schema for adding a comment to a ticket
export const addTicketCommentSchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1, "Comment cannot be empty"),
  isInternal: z.boolean().default(false),
  attachments: z
    .array(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileType: z.string(),
        fileUrl: z.string(),
      }),
    )
    .optional(),
});

// Schema for editing a comment
export const editTicketCommentSchema = z.object({
  id: z.string(),
  message: z.string().min(1, "Comment cannot be empty"),
  isInternal: z.boolean().default(false),
});

// Schema for deleting a comment
export const deleteTicketCommentSchema = z.object({
  id: z.string(),
});

// Schema for updating ticket status
export const updateTicketStatusSchema = z.object({
  id: z.string(),
  status: z.nativeEnum(TicketStatus),
});

// Export types for use in services
export type GetAllTicketsInput = z.infer<typeof getAllTicketsSchema>;
export type GetTicketByIdInput = z.infer<typeof getTicketByIdSchema>;
export type GetTicketCommentsInput = z.infer<typeof getTicketCommentsSchema>;
export type AddTicketCommentInput = z.infer<typeof addTicketCommentSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
