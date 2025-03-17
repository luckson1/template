import { FileText, ImageIcon, File } from "lucide-react";
import type { TicketStatus, TicketPriority } from "@prisma/client";

export function getFileIcon(type: string) {
  if (type.startsWith("image/")) {
    return <ImageIcon className="h-4 w-4" />;
  } else if (type.startsWith("text/")) {
    return <FileText className="h-4 w-4" />;
  } else {
    return <File className="h-4 w-4" />;
  }
}

export function getStatusColor(status: TicketStatus) {
  switch (status) {
    case "OPEN":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "NEEDS_INFO":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "RESOLVED":
      return "bg-green-50 text-green-700 border-green-200";
    case "CLOSED":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "DUPLICATE":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

export function getPriorityColor(priority: TicketPriority) {
  switch (priority) {
    case "LOW":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "MEDIUM":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "HIGH":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CRITICAL":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
