"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useOrganization } from "@/hooks/useOrganization";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, ChevronLeft } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { isSystemStaff } from "@/lib/system-roles";
import { type Session } from "next-auth";
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
import { toast } from "sonner";
import { type TicketStatus } from "@prisma/client";

// Import new components
import { TicketHeader } from "./TicketHeader";
import { TicketDetails } from "./TicketDetails";
import { TicketActions } from "./TicketActions";
import { CommentsSection } from "./CommentsSection";
import { getFileIcon, getStatusColor, getPriorityColor } from "../utils";
import type { TicketWithDetails } from "../types";

interface TicketDetailClientProps {
  id: string;
  session: Session;
}

export function TicketDetailClient({ id, session }: TicketDetailClientProps) {
  const router = useRouter();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganization();
  const [newComment, setNewComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    uploadFiles,
    isUploading: isUploadingFile,
    uploadProgress: fileUploadProgress,
  } = useFileUpload();

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

  // Mutations
  const addCommentMutation = api.ticket.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setSelectedFiles([]);
      void refetchComments();
      void refetchTicket();
      toast.success("Comment added successfully");
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error(`Failed to add comment: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const editCommentMutation = api.ticket.editComment.useMutation({
    onSuccess: () => {
      void refetchComments();
      toast.success("Comment updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update comment: ${error.message}`);
    },
  });

  const deleteCommentMutation = api.ticket.deleteComment.useMutation({
    onSuccess: () => {
      void refetchComments();
      toast.success("Comment deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete comment: ${error.message}`);
    },
  });

  const updateStatusMutation = api.ticket.updateStatus.useMutation({
    onSuccess: () => {
      void refetchTicket();
      void refetchComments();
      toast.success("Ticket status updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  // Simulate upload progress
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 0;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isUploading]);

  const handleAddComment = (params: {
    ticketId: string;
    message: string;
    isInternal: boolean;
    attachments: {
      fileName: string;
      fileSize: number;
      fileType: string;
      fileUrl: string;
    }[];
  }) => {
    setIsSubmitting(true);
    addCommentMutation.mutate(params);
  };

  const handleEditComment = (params: {
    id: string;
    message: string;
    isInternal: boolean;
  }) => {
    editCommentMutation.mutate(params);
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate({ id: commentToDelete });
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  const handleUpdateStatus = (params: { id: string; status: TicketStatus }) => {
    updateStatusMutation.mutate(params);
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
          <CardContent>
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
    <div className="container mx-auto max-w-7xl py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Breadcrumb and back button */}
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push("/tickets")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>Support</span>
            <span>/</span>
            <span>Tickets</span>
            <span>/</span>
            <span className="font-medium text-foreground">
              {ticket?.reference}
            </span>
          </div>

          {/* Ticket header */}
          <TicketHeader
            ticket={ticket as TicketWithDetails}
            commentsCount={commentsData?.length ?? 0}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            getFileIcon={getFileIcon}
          />

          {/* Comments section */}
          <CommentsSection
            comments={commentsData ?? []}
            ticketId={id}
            isAdmin={isAdmin}
            isSubmitting={isSubmitting}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            newComment={newComment}
            setNewComment={setNewComment}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            addComment={handleAddComment}
            editComment={handleEditComment}
            deleteComment={handleDeleteComment}
            getFileIcon={getFileIcon}
            currentUserId={session.user.id}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <TicketDetails
            ticket={ticket as TicketWithDetails}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
          />
          {isAdmin && (
            <TicketActions
              ticketId={id}
              currentStatus={ticket.status}
              updateStatus={handleUpdateStatus}
            />
          )}
        </div>
      </div>

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
              onClick={confirmDeleteComment}
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
