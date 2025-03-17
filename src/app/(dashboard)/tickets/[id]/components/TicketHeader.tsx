import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Download, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { TicketWithDetails } from "../types";
import type { TicketPriority, TicketStatus } from "@prisma/client";

interface TicketHeaderProps {
  ticket: TicketWithDetails;
  commentsCount: number;
  getStatusColor: (status: TicketStatus) => string;
  getPriorityColor: (priority: TicketPriority) => string;
  getFileIcon: (type: string) => JSX.Element;
}

export function TicketHeader({
  ticket,
  commentsCount,
  getStatusColor,
  getPriorityColor,
  getFileIcon,
}: TicketHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{ticket.subject}</h1>
              <Badge
                variant="outline"
                className={getStatusColor(ticket.status)}
              >
                {ticket.status.replace(/_/g, " ")}
              </Badge>
              <Badge
                variant="outline"
                className={getPriorityColor(ticket.priority)}
              >
                {ticket.priority} Priority
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-medium text-foreground">
                  #{ticket.reference}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Opened{" "}
                  {format(
                    new Date(ticket.createdAt ?? new Date()),
                    "MMM d, yyyy",
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{commentsCount} comments</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage
              src={ticket.user.image ?? ""}
              alt={ticket.user.name ?? ""}
            />
            <AvatarFallback>{ticket.user.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <div className="font-medium">{ticket.user.name}</div>
              <div className="rounded-full bg-blue-50 px-1.5 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Requester
              </div>
            </div>
            <div className="mb-4 whitespace-pre-wrap text-sm leading-relaxed">
              {ticket.message}
            </div>
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-medium">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-md border bg-background px-3 py-1 text-sm hover:bg-muted"
                    >
                      {getFileIcon(attachment.fileType)}
                      <span className="max-w-[150px] truncate">
                        {attachment.fileName}
                      </span>
                      <Download className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
