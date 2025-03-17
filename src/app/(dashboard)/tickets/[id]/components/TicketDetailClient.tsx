"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/FileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Download,
  Edit,
  FileText,
  Loader2,
  MoreVertical,
  RefreshCw,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import type { TicketStatus } from "@prisma/client";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isSystemStaff } from "@/lib/system-roles";
import { type Session } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

interface TicketDetailClientProps {
  id: string;
  session: Session;
}

export function TicketDetailClient({ id, session }: TicketDetailClientProps) {
  const router = useRouter();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganization();
  const [newComment, setNewComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [editedCommentIsInternal, setEditedCommentIsInternal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  const { uploadFiles, isUploading, uploadProgress } = useFileUpload();

  // Get ticket details
  const {
    data: ticket,
    isLoading: isLoadingTicket,
    refetch: refetchTicket,
  } = api.ticket.getById.useQuery(
    { id },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  );

  // Get ticket comments
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = api.ticket.getComments.useQuery(
    { ticketId: id },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    },
  );

  // Add comment mutation
  const addCommentMutation = api.ticket.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setSelectedFiles([]);
      void refetchComments();
      void refetchTicket();
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
    },
  });

  // Edit comment mutation
  const editCommentMutation = api.ticket.editComment.useMutation({
    onSuccess: () => {
      setEditingCommentId(null);
      setEditedCommentText("");
      setEditedCommentIsInternal(false);
      void refetchComments();
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = api.ticket.deleteComment.useMutation({
    onSuccess: () => {
      void refetchComments();
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });

  // Update ticket status mutation
  const updateStatusMutation = api.ticket.updateStatus.useMutation({
    onSuccess: () => {
      setNewStatus("");
      void refetchTicket();
      void refetchComments();
      toast.success("Ticket status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Handle file selection
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  // Handle file removal
  const handleFileRemoved = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files if any
      let attachments: {
        fileName: string;
        fileSize: number;
        fileType: string;
        fileUrl: string;
      }[] = [];

      if (selectedFiles.length > 0) {
        const uploadedFiles = await uploadFiles(selectedFiles);
        attachments = uploadedFiles.map((file) => ({
          fileName: file.fileName,
          fileSize: file.size,
          fileType: file.contentType,
          fileUrl: file.url,
        }));
      }

      // Add comment
      await addCommentMutation.mutateAsync({
        ticketId: id,
        message: newComment,
        isInternal,
        attachments,
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus) return;

    await updateStatusMutation.mutateAsync({
      id,
      status: newStatus,
    });
  };

  // Define a type for comment
  type TicketComment = {
    id: string;
    message: string;
    createdAt: Date;
    isInternal: boolean;
    user?: {
      id: string;
      name: string | null;
      image: string | null;
    };
    attachments?: {
      id: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      fileUrl: string;
      ticketId: string;
      ticketCommentId: string | null;
      createdAt: Date;
    }[];
  };

  // Handle edit comment
  const handleEditComment = (comment: TicketComment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.message);
    setEditedCommentIsInternal(comment.isInternal);
  };

  // Handle save edited comment
  const handleSaveEditedComment = async () => {
    if (!editingCommentId || !editedCommentText.trim()) return;

    await editCommentMutation.mutateAsync({
      id: editingCommentId,
      message: editedCommentText,
      isInternal: editedCommentIsInternal,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
    setEditedCommentIsInternal(false);
  };

  // Handle delete comment dialog open
  const handleDeleteDialogOpen = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  // Handle delete comment
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteCommentMutation.mutateAsync({
        id: commentToDelete,
      });
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isLoading = isLoadingOrg || isLoadingTicket;
  const isAdmin = isSystemStaff(session?.user);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Ticket Details Skeleton */}
        <Card className="mx-auto mb-6 w-full max-w-4xl">
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="mt-2 h-4 w-48" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Skeleton className="mb-4 h-8 w-3/4" />

            <div className="mb-6 flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>

                <Skeleton className="h-32 w-full rounded-lg" />

                <div className="mt-4">
                  <Skeleton className="mb-2 h-5 w-24" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-md" />
          </CardContent>
        </Card>

        {/* Comments Skeleton */}
        <Skeleton className="mx-auto mb-4 h-8 w-32" />

        <Card className="mx-auto mb-6 w-full max-w-4xl">
          <CardContent className="p-6">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add Comment Skeleton */}
        <Card className="mx-auto mb-6 w-full max-w-4xl">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>

          <CardContent>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="mt-4 h-8 w-32" />
            <Skeleton className="mt-4 h-24 w-full" />
          </CardContent>

          <CardFooter className="flex justify-between">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push("/tickets")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Button>

        <Card>
          <CardContent className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-medium">Ticket not found</h3>
            <p className="mb-6 max-w-md text-muted-foreground">
              The ticket you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have permission to view it.
            </p>
            <Button onClick={() => router.push("/tickets")}>
              Return to Tickets
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tickets
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void refetchTicket();
              void refetchComments();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as TicketStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="NEEDS_INFO">Needs Info</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="DUPLICATE">Duplicate</SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                onClick={handleStatusUpdate}
                disabled={!newStatus || updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Update
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Details */}
      <Card className="mx-auto mb-6 w-full max-w-4xl">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{ticket.reference}</h2>
                <Badge
                  variant="outline"
                  className={getStatusColor(ticket.status)}
                >
                  {ticket.status.replace(/_/g, " ")}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Created {format(new Date(ticket.createdAt), "PPP")} • Last
                updated{" "}
                {formatDistanceToNow(new Date(ticket.updatedAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {ticket.category.replace(/_/g, " ")}
              </Badge>
              <Badge
                variant="outline"
                className={
                  ticket.priority === "LOW"
                    ? "bg-gray-50 text-gray-700"
                    : ticket.priority === "MEDIUM"
                      ? "bg-blue-50 text-blue-700"
                      : ticket.priority === "HIGH"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                }
              >
                {ticket.priority} Priority
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="mb-4 text-xl font-semibold">{ticket.subject}</h3>

          <div className="mb-6 flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={ticket.user.image ?? ""}
                alt={ticket.user.name ?? "User"}
              />
              <AvatarFallback>
                {ticket.user.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium">
                  {ticket.user.name ?? "Anonymous"}
                </span>
                <span className="text-sm text-muted-foreground">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {formatDistanceToNow(new Date(ticket.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="whitespace-pre-wrap">{ticket.message}</p>
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
                        <FileText className="h-4 w-4" />
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

          {ticket.assignee && (
            <div className="mb-4 rounded-md bg-muted/50 p-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Assigned to{" "}
                  <span className="font-medium">{ticket.assignee.name}</span>
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <h3 className="mx-auto mb-4 w-full max-w-4xl text-center text-xl font-semibold">
        Comments
      </h3>

      <Card className="mx-auto mb-6 w-full max-w-4xl">
        <CardContent className="p-6">
          {isLoadingComments ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : commentsData && commentsData.length > 0 ? (
            <div className="space-y-6">
              {commentsData.map((comment) => (
                <div key={comment.id} className="flex items-start gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={comment.user?.image ?? ""}
                      alt={comment.user?.name ?? "User"}
                    />
                    <AvatarFallback>
                      {comment.user?.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {comment.user?.name ?? "Anonymous"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>

                        {comment.isInternal && (
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700"
                          >
                            Internal
                          </Badge>
                        )}
                      </div>

                      {/* Edit/Delete dropdown - only show for comment author or admin */}
                      {((comment.user?.id &&
                        comment.user.id === session.user.id) ||
                        isAdmin) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditComment(comment)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDialogOpen(comment.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editedCommentText}
                          onChange={(e) => setEditedCommentText(e.target.value)}
                          className="min-h-[100px]"
                        />

                        {isAdmin && (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`edit-internal-comment-${comment.id}`}
                              checked={editedCommentIsInternal}
                              onChange={(e) =>
                                setEditedCommentIsInternal(e.target.checked)
                              }
                              className="h-4 w-4 rounded border-gray-300"
                              disabled={editCommentMutation.isPending}
                            />
                            <label
                              htmlFor={`edit-internal-comment-${comment.id}`}
                              className="text-sm"
                            >
                              Mark as internal comment (only visible to staff)
                            </label>
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEditedComment}
                            disabled={
                              !editedCommentText.trim() ||
                              editCommentMutation.isPending
                            }
                          >
                            {editCommentMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="mr-2 h-4 w-4" />
                            )}
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`rounded-lg p-4 ${
                            comment.isInternal ? "bg-purple-50" : "bg-muted/50"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {comment.message}
                          </p>
                        </div>

                        {comment.attachments &&
                          comment.attachments.length > 0 && (
                            <div className="mt-4">
                              <h4 className="mb-2 text-sm font-medium">
                                Attachments
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {comment.attachments.map((attachment) => (
                                  <a
                                    key={attachment.id}
                                    href={attachment.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 rounded-md border bg-background px-3 py-1 text-sm hover:bg-muted"
                                  >
                                    <FileText className="h-4 w-4" />
                                    <span className="max-w-[150px] truncate">
                                      {attachment.fileName}
                                    </span>
                                    <Download className="h-3 w-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No comments yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Comment */}
      <Card className="mx-auto mb-6 w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Add a Comment</CardTitle>
          <CardDescription>
            Provide additional information or updates about your ticket
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Type your comment here..."
              className="min-h-[120px]"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting || isUploading}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Attachments</label>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                onFileRemoved={handleFileRemoved}
                selectedFiles={selectedFiles}
                isUploading={isUploading}
              />
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="internal-comment"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                  disabled={isSubmitting || isUploading}
                />
                <label htmlFor="internal-comment" className="text-sm">
                  Mark as internal comment (only visible to staff)
                </label>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => {
              setNewComment("");
              setSelectedFiles([]);
              setIsInternal(false);
            }}
            disabled={isSubmitting || isUploading}
          >
            Clear
          </Button>

          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading
                  ? `Uploading ${Math.round(uploadProgress)}%`
                  : "Submitting..."}
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Comment
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Comment Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
