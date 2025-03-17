import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  RefreshCw,
  User,
} from "lucide-react";
import type { TicketStatus } from "@prisma/client";

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TicketStatus;
  updateStatus: (params: { id: string; status: TicketStatus }) => void;
}

export function TicketActions({
  ticketId,
  currentStatus,

  updateStatus,
}: TicketActionsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="mb-4 font-medium">Quick Actions</h3>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              updateStatus({ id: ticketId, status: "IN_PROGRESS" })
            }
            disabled={currentStatus === "IN_PROGRESS"}
          >
            <Clock className="mr-2 h-4 w-4 text-amber-600" />
            Mark In Progress
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => updateStatus({ id: ticketId, status: "NEEDS_INFO" })}
            disabled={currentStatus === "NEEDS_INFO"}
          >
            <RefreshCw className="mr-2 h-4 w-4 text-purple-600" />
            Request More Info
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => updateStatus({ id: ticketId, status: "RESOLVED" })}
            disabled={currentStatus === "RESOLVED"}
          >
            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
            Mark as Resolved
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => updateStatus({ id: ticketId, status: "DUPLICATE" })}
            disabled={currentStatus === "DUPLICATE"}
          >
            <Copy className="mr-2 h-4 w-4 text-slate-600" />
            Mark as Duplicate
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start text-red-600"
            onClick={() => updateStatus({ id: ticketId, status: "CLOSED" })}
            disabled={currentStatus === "CLOSED"}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Close Ticket
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
