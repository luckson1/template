import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { TicketWithDetails } from "../types";
import type { TicketPriority, TicketStatus } from "@prisma/client";

interface TicketDetailsProps {
  ticket: TicketWithDetails;
  getStatusColor: (status: TicketStatus) => string;
  getPriorityColor: (priority: TicketPriority) => string;
}

export function TicketDetails({
  ticket,
  getStatusColor,
  getPriorityColor,
}: TicketDetailsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 font-medium">Ticket Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Status</div>
            <div className="font-medium">
              <Badge
                variant="outline"
                className={getStatusColor(ticket.status)}
              >
                {ticket.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Priority</div>
            <div className="font-medium">
              <Badge
                variant="outline"
                className={getPriorityColor(ticket.priority)}
              >
                {ticket.priority} Priority
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Category</div>
            <div className="font-medium">
              {ticket.category.replace(/_/g, " ")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Created</div>
            <div className="font-medium">
              {format(new Date(ticket.createdAt ?? new Date()), "MMM d, yyyy")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Last Updated</div>
            <div className="font-medium">
              {format(new Date(ticket.updatedAt ?? new Date()), "MMM d, yyyy")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">Requester</div>
            <div className="flex items-center gap-1 font-medium">
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={ticket.user.image ?? ""}
                  alt={ticket.user.name ?? ""}
                />
                <AvatarFallback>{ticket.user.name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              {ticket.user.name}
            </div>
          </div>
          {ticket.assignee && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Assignee</div>
              <div className="flex items-center gap-1 font-medium">
                <Avatar className="h-4 w-4">
                  <AvatarImage
                    src={ticket.assignee.image ?? ""}
                    alt={ticket.assignee.name ?? ""}
                  />
                  <AvatarFallback>
                    {ticket.assignee.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                {ticket.assignee.name}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
