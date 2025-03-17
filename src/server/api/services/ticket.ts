import { TRPCError } from "@trpc/server";
import type { PrismaClient, Prisma } from "@prisma/client";
import type {
  GetAllTicketsInput,
  GetTicketByIdInput,
  GetTicketCommentsInput,
  AddTicketCommentInput,
  UpdateTicketStatusInput,
} from "../schemas/ticket";
import { isSystemStaff } from "@/lib/system-roles";
import { type User } from "next-auth";

interface IServiceContext {
  user: User | null;
  db: PrismaClient;
}

export const ticketService = {
  // Get all tickets with filtering, sorting, and pagination
  getAll: async ({
    user,
    db,
    input,
  }: IServiceContext & { input: GetAllTicketsInput }) => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view tickets",
        });
      }

      const {
        organizationId,
        page,
        limit,
        status,
        priority,
        category,
        search,
        sortBy,
        sortDirection,
      } = input;

      const userId = user.id;
      const skip = (page - 1) * limit;

      const isStaff = isSystemStaff(user);
      console.log("isStaff", isStaff);
      // Build filter conditions
      const where: Prisma.SupportTicketWhereInput = {};

      // If not staff, only show tickets from user's organization
      if (!isStaff) {
        if (organizationId) {
          where.organizationId = organizationId;
        } else {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Organization ID is required",
          });
        }
      }

      // If staff and organizationId provided, filter by that org
      if (isStaff) {
        where.organizationId = undefined;
      }

      // Add filters if provided
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (category) where.category = category;

      // Add search if provided
      if (search) {
        where.OR = [
          { subject: { contains: search, mode: "insensitive" } },
          { reference: { contains: search, mode: "insensitive" } },
        ];
      }

      const [tickets, totalCount] = await Promise.all([
        db.supportTicket.findMany({
          where,
          orderBy: {
            [sortBy]: sortDirection,
          },
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            assignee: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                comments: {
                  where: {
                    isInternal: !isStaff ? false : undefined,
                  },
                },
              },
            },
          },
        }),
        db.supportTicket.count({ where }),
      ]);

      // Transform tickets to include comment count
      const transformedTickets = tickets.map((ticket) => ({
        ...ticket,
        commentCount: ticket._count.comments,
        _count: undefined,
      }));

      return {
        tickets: transformedTickets,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        page,
        limit,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch tickets",
      });
    }
  },

  // Get a single ticket by ID
  getById: async ({
    user,
    db,
    input,
  }: IServiceContext & { input: GetTicketByIdInput }) => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view a ticket",
        });
      }

      const { id } = input;
      const userId = user.id;
      const isStaff = isSystemStaff(user);

      const ticket = await db.supportTicket.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          attachments: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }

      // Check if user has access to this ticket
      if (!isStaff && ticket.userId !== userId) {
        // Check if user is in the same organization
        const userOrg = ticket.organizationId
          ? await db.userOrganization.findFirst({
              where: {
                userId,
                organizationId: ticket.organizationId,
              },
            })
          : null;

        if (!userOrg) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this ticket",
          });
        }
      }

      return ticket;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch ticket",
      });
    }
  },

  // Get comments for a ticket
  getComments: async ({
    user,
    db,
    input,
  }: IServiceContext & { input: GetTicketCommentsInput }) => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to view comments",
        });
      }

      const { ticketId } = input;
      const userId = user.id;
      const isStaff = isSystemStaff(user);

      // Get the ticket to check permissions
      const ticket = await db.supportTicket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          userId: true,
          organizationId: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }

      // Check if user has access to this ticket
      if (!isStaff && ticket.userId !== userId) {
        // Check if user is in the same organization
        const userOrg = ticket.organizationId
          ? await db.userOrganization.findFirst({
              where: {
                userId,
                organizationId: ticket.organizationId,
              },
            })
          : null;

        if (!userOrg) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this ticket",
          });
        }
      }

      // Get comments (filter internal comments if not staff)
      const comments = await db.ticketComment.findMany({
        where: {
          ticketId,
          // Only staff can see internal comments
          ...(!isStaff && { isInternal: false }),
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          attachments: true,
        },
      });

      return comments;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch comments",
      });
    }
  },

  // Add a comment to a ticket
  addComment: async ({
    user,
    db,
    input,
  }: IServiceContext & { input: AddTicketCommentInput }) => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add a comment",
        });
      }

      const { ticketId, message, isInternal, attachments } = input;
      const isStaff = isSystemStaff(user);

      // Get the ticket to check permissions
      const ticket = await db.supportTicket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          userId: true,
          organizationId: true,
          status: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }

      // Check if user has access to this ticket
      if (!isStaff && ticket.userId !== userId) {
        // Check if user is in the same organization
        const userOrg = ticket.organizationId
          ? await db.userOrganization.findFirst({
              where: {
                userId,
                organizationId: ticket.organizationId,
              },
            })
          : null;

        if (!userOrg) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this ticket",
          });
        }
      }

      // Only staff can add internal comments
      if (isInternal && !isStaff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only staff can add internal comments",
        });
      }

      // Create the comment
      const comment = await db.ticketComment.create({
        data: {
          message,
          isInternal,
          userId,
          ticketId,
        },
      });

      // Add attachments if any
      if (attachments && attachments.length > 0) {
        await Promise.all(
          attachments.map((attachment) =>
            db.ticketAttachment.create({
              data: {
                ...attachment,
                ticketId,
              },
            }),
          ),
        );
      }

      // If ticket is resolved or closed, reopen it when user adds a comment
      if (
        (ticket.status === "RESOLVED" || ticket.status === "CLOSED") &&
        !isStaff &&
        !isInternal
      ) {
        await db.supportTicket.update({
          where: { id: ticketId },
          data: { status: "OPEN" },
        });
      }

      return comment;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add comment",
      });
    }
  },

  // Edit a comment
  editComment: async ({
    user,
    db,
    input,
  }: IServiceContext & {
    input: { id: string; message: string; isInternal: boolean };
  }) => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to edit a comment",
        });
      }

      const { id, message, isInternal } = input;
      const isStaff = isSystemStaff(user);

      // Get the comment to check permissions
      const comment = await db.ticketComment.findUnique({
        where: { id },
        include: {
          ticket: {
            select: {
              id: true,
              userId: true,
              organizationId: true,
            },
          },
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Check if user has permission to edit this comment
      // Only the comment author or staff can edit comments
      if (comment.userId !== userId && !isStaff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to edit this comment",
        });
      }

      // Only staff can set comments as internal
      if (isInternal && !isStaff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only staff can mark comments as internal",
        });
      }

      // Update the comment
      const updatedComment = await db.ticketComment.update({
        where: { id },
        data: {
          message,
          isInternal,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          attachments: true,
        },
      });

      return updatedComment;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to edit comment",
      });
    }
  },

  // Delete a comment
  deleteComment: async ({
    user,
    db,
    input,
  }: IServiceContext & { input: { id: string } }) => {
    try {
      const userId = user?.id;
      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a comment",
        });
      }

      const { id } = input;
      const isStaff = isSystemStaff(user);

      // Get the comment to check permissions
      const comment = await db.ticketComment.findUnique({
        where: { id },
        include: {
          ticket: {
            select: {
              id: true,
              userId: true,
              organizationId: true,
            },
          },
        },
      });

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      // Check if user has permission to delete this comment
      // Only the comment author or staff can delete comments
      if (comment.userId !== userId && !isStaff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to delete this comment",
        });
      }

      // Delete the comment
      await db.ticketComment.delete({
        where: { id },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete comment",
      });
    }
  },

  // Update ticket status
  updateStatus: async ({
    user,
    db,
    input,
  }: IServiceContext & { input: UpdateTicketStatusInput }) => {
    try {
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a ticket",
        });
      }

      const { id, status } = input;
      const userId = user.id;
      const isStaff = isSystemStaff(user);

      // Get the ticket to check permissions
      const ticket = await db.supportTicket.findUnique({
        where: { id },
        select: {
          id: true,
          organizationId: true,
        },
      });

      if (!ticket) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ticket not found",
        });
      }

      // Only staff can update ticket status
      if (!isStaff) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only staff can update ticket status",
        });
      }

      // Update the ticket status
      const updatedTicket = await db.supportTicket.update({
        where: { id },
        data: {
          status,
          ...(status === "RESOLVED" && { resolvedAt: new Date() }),
        },
      });

      // Add a system comment about the status change
      if (userId) {
        await db.ticketComment.create({
          data: {
            message: `Ticket status changed to ${status.replace(/_/g, " ")}`,
            isInternal: true,
            userId,
            ticketId: id,
          },
        });
      }

      return updatedTicket;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update ticket status",
      });
    }
  },
};
