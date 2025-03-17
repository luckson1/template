"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  ChevronDown,
  Filter,
  Loader2,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Helper function to get status color
const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case "OPEN":
      return "bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700";
    case "NEEDS_INFO":
      return "bg-purple-50 text-purple-700";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700";
    case "CLOSED":
      return "bg-gray-50 text-gray-700";
    case "DUPLICATE":
      return "bg-slate-50 text-slate-700";
    default:
      return "";
  }
};

// Helper function to get priority color
const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case "LOW":
      return "bg-gray-50 text-gray-700";
    case "MEDIUM":
      return "bg-blue-50 text-blue-700";
    case "HIGH":
      return "bg-amber-50 text-amber-700";
    case "CRITICAL":
      return "bg-red-50 text-red-700";
    default:
      return "";
  }
};

// Helper function to format category
const formatCategory = (category: TicketCategory) => {
  return category.replace(/_/g, " ");
};

export default function TicketsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganization();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">(
    "all",
  );
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">(
    "all",
  );

  // Sorting state
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Get tickets with filters

  const {
    data: ticketsData,
    isLoading: isLoadingTickets,
    refetch: refetchTickets,
  } = api.ticket.getAll.useQuery(
    {
      organizationId: selectedOrg?.id,
      page: currentPage,
      limit: pageSize,
      status: statusFilter !== "all" ? statusFilter : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      search: searchQuery ? searchQuery : undefined,
      sortBy: sortField,
      sortDirection,
    },
    {
      enabled: !!selectedOrg?.id,
    },
  );

  // Handle URL params for filters
  useEffect(() => {
    const status = searchParams.get("status") as TicketStatus | null;
    const priority = searchParams.get("priority") as TicketPriority | null;
    const category = searchParams.get("category") as TicketCategory | null;
    const search = searchParams.get("search");

    if (status) setStatusFilter(status);
    if (priority) setPriorityFilter(priority);
    if (category) setCategoryFilter(category);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    if (categoryFilter !== "all") params.set("category", categoryFilter);
    if (searchQuery) params.set("search", searchQuery);

    router.push(`/tickets?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setCategoryFilter("all");
    setSearchQuery("");
    router.push("/tickets");
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Navigate to ticket detail
  const navigateToTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  // Create new ticket
  const navigateToCreateTicket = () => {
    router.push("/support");
  };

  const isLoading = isLoadingOrg || isLoadingTickets;
  const tickets = ticketsData?.tickets ?? [];
  const totalTickets = ticketsData?.totalCount ?? 0;
  const totalPages = Math.ceil(totalTickets / pageSize);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and track all your support requests in one place
          </p>
        </div>
        <Button onClick={navigateToCreateTicket}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Filters</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button size="sm" onClick={applyFilters} disabled={isLoading}>
                Apply Filters
              </Button>
            </div>
          </div>
          <CardDescription>
            Filter tickets by status, priority, category, or search by subject
            and reference
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as TicketStatus)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="NEEDS_INFO">Needs Info</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as TicketPriority)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={categoryFilter}
              onValueChange={(value) =>
                setCategoryFilter(value as TicketCategory)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ACCOUNT">Account</SelectItem>
                <SelectItem value="BILLING">Billing</SelectItem>
                <SelectItem value="TECHNICAL">Technical</SelectItem>
                <SelectItem value="FEATURE">Feature</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => refetchTickets()}
                disabled={isLoading}
                className="h-10 w-10"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto flex-1"
                    disabled={isLoading}
                  >
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Display Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPageSize(5)}>
                    Show 5 per page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageSize(10)}>
                    Show 10 per page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageSize(25)}>
                    Show 25 per page
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPageSize(50)}>
                    Show 50 per page
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-5 w-24" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                    <TableHead>
                      <Skeleton className="h-5 w-20" />
                    </TableHead>
                    <TableHead className="text-right">
                      <Skeleton className="ml-auto h-5 w-20" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Skeleton className="h-5 w-10" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-medium">No tickets found</h3>
              <p className="mb-6 max-w-md text-muted-foreground">
                {statusFilter || priorityFilter || categoryFilter || searchQuery
                  ? "Try adjusting your filters or search query"
                  : "You haven't created any support tickets yet"}
              </p>
              <Button onClick={navigateToCreateTicket}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-[120px] cursor-pointer"
                      onClick={() => handleSortChange("reference")}
                    >
                      <div className="flex items-center">
                        Reference
                        {sortField === "reference" && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 transition-transform ${
                              sortDirection === "asc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSortChange("subject")}
                    >
                      <div className="flex items-center">
                        Subject
                        {sortField === "subject" && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 transition-transform ${
                              sortDirection === "asc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      <div className="flex items-center">
                        Created
                        {sortField === "createdAt" && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 transition-transform ${
                              sortDirection === "asc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSortChange("updatedAt")}
                    >
                      <div className="flex items-center">
                        Updated
                        {sortField === "updatedAt" && (
                          <ChevronDown
                            className={`ml-1 h-4 w-4 transition-transform ${
                              sortDirection === "asc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigateToTicket(ticket.id)}
                    >
                      <TableCell className="font-medium">
                        {ticket.reference}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {ticket.subject}
                      </TableCell>
                      <TableCell>{formatCategory(ticket.category)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPriorityColor(ticket.priority)}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusColor(ticket.status)}
                        >
                          {ticket.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.createdAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.updatedAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{ticket.commentCount || 0}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {isLoading ? (
        <div className="mt-6 flex items-center justify-between">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-10 w-64" />
        </div>
      ) : (
        !isLoading &&
        tickets.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalTickets)}
              </span>{" "}
              of <span className="font-medium">{totalTickets}</span> tickets
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;

                  // Adjust page numbers for pagination with ellipsis
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                  }

                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )
      )}
    </div>
  );
}
