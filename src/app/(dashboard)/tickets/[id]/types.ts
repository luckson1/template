import type {
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from "@prisma/client";

export interface TicketUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

export interface TicketCommentAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
}

export interface TicketComment {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: Date;
  user: TicketUser | null;
  attachments: TicketCommentAttachment[];
}

export interface TicketWithDetails {
  id: string;
  reference: string;
  subject: string;
  message: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: Date;
  updatedAt: Date;
  user: TicketUser;
  assignee: TicketUser | null;
  attachments: TicketAttachment[];
}
