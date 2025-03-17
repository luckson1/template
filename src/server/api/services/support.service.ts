import { TRPCError } from "@trpc/server";
import type {
  PrismaClient,
  SupportTicket,
  TicketComment,
  TicketAttachment,
  Prisma,
} from "@prisma/client";
import type {
  ICreateTicket,
  IUpdateTicket,
  IListTickets,
  ICreateComment,
  ICreateAttachment,
} from "../schemas/support.schema";
import { type User } from "next-auth";
import { isSystemStaff } from "@/lib/system-roles";

interface ISupportServiceContext {
  user: User | null;
  db: PrismaClient;
}

export const supportService = {
  // Create a new support ticket
  createTicket: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: ICreateTicket;
  }): Promise<SupportTicket> => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a support ticket",
        });
      }

      // Generate a unique reference number for the ticket
      const reference = `TICK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      return await db.supportTicket.create({
        data: {
          ...input,
          reference,
          userId,
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create support ticket",
      });
    }
  },

  // Get a ticket by ID
  getTicketById: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: { id: string };
  }): Promise<
    SupportTicket & {
      comments: TicketComment[];
      attachments: TicketAttachment[];
      user: User;
      assignee: User | null;
    }
  > => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view a support ticket",
        });
      }

      const ticket = await db.supportTicket.findUnique({
        where: { id: input.id },
        include: {
          comments: {
            orderBy: { createdAt: "asc" },
            include: { user: true },
          },
          attachments: true,
          user: true,
          assignee: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      // Check if user has access to this ticket
      // First check if user is a system admin or support staff
      const isSystemStaffMember = isSystemStaff(user);

      // If not a system staff member, check organization-level permissions
      const isAdmin = !isSystemStaffMember
        ? await db.userOrganization.findFirst({
            where: {
              userId: user.id,
              organizationId: ticket.organizationId ?? "",
              role: { in: ["ADMIN", "OWNER"] },
            },
          })
        : null;

      const isOwner = ticket.userId === user.id;
      const isAssignee = ticket.assigneeId === user.id;

      // Allow access if user is system staff, owner, admin, or assignee
      if (!isSystemStaffMember && !isOwner && !isAdmin && !isAssignee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this ticket",
        });
      }

      // Filter out internal comments for non-admin/non-assignee users
      if (!isSystemStaffMember && !isAdmin && !isAssignee) {
        ticket.comments = ticket.comments.filter(
          (comment) => !comment.isInternal,
        );
      }

      return ticket;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch support ticket",
      });
    }
  },

  // Update a ticket
  updateTicket: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: IUpdateTicket;
  }): Promise<SupportTicket> => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a support ticket",
        });
      }

      const { id, ...data } = input;

      const ticket = await db.supportTicket.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      // Check if user has permission to update this ticket
      const isAdmin = await db.userOrganization.findFirst({
        where: {
          userId: user.id,
          organizationId: ticket.organizationId ?? "",
          role: { in: ["ADMIN", "OWNER"] },
        },
      });

      const isOwner = ticket.userId === user.id;
      const isAssignee = ticket.assigneeId === user.id;

      if (!isOwner && !isAdmin && !isAssignee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this ticket",
        });
      }

      // If status is being updated to RESOLVED, set resolvedAt
      const updateData: Omit<IUpdateTicket, "id"> & {
        resolvedAt?: Date | null;
      } = { ...data };
      if (data.status === "RESOLVED" && ticket.status !== "RESOLVED") {
        updateData.resolvedAt = new Date();
      } else if (data.status && data.status !== "RESOLVED") {
        updateData.resolvedAt = null;
      }

      return await db.supportTicket.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update support ticket",
      });
    }
  },

  // List tickets with filtering and pagination
  listTickets: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: IListTickets;
  }) => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to list support tickets",
        });
      }

      const { limit, cursor, ...filters } = input;

      // Build the where clause based on filters
      const where: Prisma.SupportTicketWhereInput = {};

      // Apply status filter if provided
      if (filters.status) {
        where.status = filters.status;
      }

      // Apply category filter if provided
      if (filters.category) {
        where.category = filters.category;
      }

      // Apply priority filter if provided
      if (filters.priority) {
        where.priority = filters.priority;
      }

      // Apply organization filter if provided
      if (filters.organizationId) {
        where.organizationId = filters.organizationId;

        // Check if user belongs to this organization
        const userOrg = await db.userOrganization.findFirst({
          where: {
            userId: user.id,
            organizationId: filters.organizationId,
          },
        });

        if (!userOrg) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You don't have permission to view tickets for this organization",
          });
        }
      } else {
        // If no organization specified, only show tickets created by the user
        // or tickets from organizations they belong to
        const userOrgs = await db.userOrganization.findMany({
          where: {
            userId: user.id,
          },
          select: {
            organizationId: true,
          },
        });

        const orgIds = userOrgs.map((org) => org.organizationId);

        where.OR = [{ userId: user.id }, { organizationId: { in: orgIds } }];
      }

      // Apply assignee filter if provided
      if (filters.assigneeId) {
        where.assigneeId = filters.assigneeId;
      }

      // Apply user filter if provided
      if (filters.userId) {
        where.userId = filters.userId;
      }

      // Get one more item than requested for cursor-based pagination
      const tickets = await db.supportTicket.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (tickets.length > limit) {
        const nextItem = tickets.pop();
        nextCursor = nextItem?.id;
      }

      return {
        tickets,
        nextCursor,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list support tickets",
      });
    }
  },

  // Add a comment to a ticket
  addComment: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: ICreateComment;
  }): Promise<TicketComment> => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to comment on a support ticket",
        });
      }

      const ticket = await db.supportTicket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      // Check if user has permission to comment on this ticket
      const isAdmin = await db.userOrganization.findFirst({
        where: {
          userId: user.id,
          organizationId: ticket.organizationId ?? "",
          role: { in: ["ADMIN", "OWNER"] },
        },
      });

      const isOwner = ticket.userId === user.id;
      const isAssignee = ticket.assigneeId === user.id;

      if (!isOwner && !isAdmin && !isAssignee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to comment on this ticket",
        });
      }

      // Only admins and assignees can add internal comments
      if (input.isInternal && !isAdmin && !isAssignee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add internal comments",
        });
      }

      // Create the comment
      const comment = await db.ticketComment.create({
        data: {
          ...input,
          userId,
        },
      });

      // If this is a customer comment and the ticket is in WAITING_ON_CUSTOMER status,
      // update it back to IN_PROGRESS
      if (!input.isInternal && ticket.status === "WAITING_ON_CUSTOMER") {
        await db.supportTicket.update({
          where: { id: ticket.id },
          data: { status: "IN_PROGRESS" },
        });
      }

      return comment;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add comment to support ticket",
      });
    }
  },

  // Add an attachment to a ticket
  addAttachment: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: ICreateAttachment;
  }): Promise<TicketAttachment> => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "You must be logged in to add attachments to a support ticket",
        });
      }

      const ticket = await db.supportTicket.findUnique({
        where: { id: input.ticketId },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      // Check if user has permission to add attachments to this ticket
      const isAdmin = await db.userOrganization.findFirst({
        where: {
          userId: user.id,
          organizationId: ticket.organizationId ?? "",
          role: { in: ["ADMIN", "OWNER"] },
        },
      });

      const isOwner = ticket.userId === user.id;
      const isAssignee = ticket.assigneeId === user.id;

      if (!isOwner && !isAdmin && !isAssignee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to add attachments to this ticket",
        });
      }

      // Create the attachment
      return await db.ticketAttachment.create({
        data: input,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add attachment to support ticket",
      });
    }
  },

  // Delete a ticket (admin only)
  deleteTicket: async ({
    user,
    db,
    input,
  }: ISupportServiceContext & {
    input: { id: string };
  }): Promise<{ success: boolean }> => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a support ticket",
        });
      }

      const ticket = await db.supportTicket.findUnique({
        where: { id: input.id },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Support ticket not found",
        });
      }

      // Only admins can delete tickets
      const isAdmin = await db.userOrganization.findFirst({
        where: {
          userId: user.id,
          organizationId: ticket.organizationId ?? "",
          role: { in: ["ADMIN", "OWNER"] },
        },
      });

      if (!isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can delete support tickets",
        });
      }

      // Delete the ticket (cascade will handle comments and attachments)
      await db.supportTicket.delete({
        where: { id: input.id },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete support ticket",
      });
    }
  },
};
