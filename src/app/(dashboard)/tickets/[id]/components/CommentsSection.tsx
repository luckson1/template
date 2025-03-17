/* eslint-disable @next/next/no-img-element */
import {
  useState,
  useRef,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Check,
  ExternalLink,
  File,
  Download,
  Loader2,
  Paperclip,
  Send,
  X,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import type { TicketComment, TicketCommentAttachment } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CommentsSectionProps {
  comments: TicketComment[];
  ticketId: string;
  isAdmin: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  uploadProgress: number;
  newComment: string;
  setNewComment: (value: string) => void;
  selectedFiles: File[];
  setSelectedFiles: Dispatch<SetStateAction<File[]>>;
  addComment: (params: {
    ticketId: string;
    message: string;
    isInternal: boolean;
    attachments: {
      fileName: string;
      fileSize: number;
      fileType: string;
      fileUrl: string;
    }[];
  }) => void;
  editComment: (params: {
    id: string;
    message: string;
    isInternal: boolean;
  }) => void;
  deleteComment: (commentId: string) => void;
  getFileIcon: (type: string) => JSX.Element;
  currentUserId: string;
}

export function CommentsSection({
  comments,
  ticketId,
  isAdmin,
  isSubmitting,
  isUploading,
  uploadProgress,
  newComment,
  setNewComment,
  selectedFiles,
  setSelectedFiles,
  addComment,
  editComment,
  deleteComment,
  getFileIcon,
  currentUserId,
}: CommentsSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isInternal, setIsInternal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [editedCommentIsInternal, setEditedCommentIsInternal] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<{
    id: string;
    url: string;
    name: string;
  } | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments?.length]);

  // File handling functions
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeAttachment = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComment = () => {
    addComment({
      ticketId,
      message: newComment,
      isInternal,
      attachments: selectedFiles.map((file) => ({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: URL.createObjectURL(file),
      })),
    });
  };

  const handleEditComment = (comment: TicketComment) => {
    setEditingCommentId(comment.id);
    setEditedCommentText(comment.message);
    setEditedCommentIsInternal(comment.isInternal);
  };

  const handleSaveEdit = () => {
    if (editingCommentId) {
      editComment({
        id: editingCommentId,
        message: editedCommentText,
        isInternal: editedCommentIsInternal,
      });
      cancelEdit();
    }
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentText("");
    setEditedCommentIsInternal(false);
  };

  // Check if user can edit/delete a comment
  const canModifyComment = (comment: TicketComment) => {
    return isAdmin || comment.user?.id === currentUserId;
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <ScrollArea className="h-fit min-h-[300px] pr-4">
            <div className="space-y-6">
              {comments?.map((comment) => (
                <div
                  key={comment.id}
                  className={`flex items-start gap-4 ${comment.isInternal ? "ml-0" : "ml-6"}`}
                >
                  <Avatar
                    className={`h-8 w-8 border-2 ${comment.isInternal ? "border-primary/10" : "border-secondary/10"}`}
                  >
                    <AvatarImage
                      src={comment.user?.image ?? ""}
                      alt={comment.user?.name ?? ""}
                    />
                    <AvatarFallback>
                      {comment.user?.name?.[0] ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 rounded-lg p-4 ${
                      comment.isInternal
                        ? "border bg-white shadow-sm dark:bg-slate-900"
                        : "bg-secondary/20 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{comment.user?.name}</div>
                        {comment.isInternal && (
                          <div className="rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary dark:bg-primary/20">
                            Internal
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-xs text-muted-foreground">
                                {format(
                                  new Date(comment.createdAt),
                                  "MMM d, h:mm a",
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {format(
                                  new Date(comment.createdAt),
                                  "MMMM d, yyyy h:mm a",
                                )}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {canModifyComment(comment) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditComment(comment)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit comment
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteComment(comment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
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
                            />
                            <label
                              htmlFor={`edit-internal-comment-${comment.id}`}
                              className="text-sm"
                            >
                              Mark as internal comment
                            </label>
                          </div>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={!editedCommentText.trim()}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3 whitespace-pre-wrap text-sm leading-relaxed">
                          {comment.message}
                        </div>
                        {comment.attachments &&
                          comment.attachments.length > 0 && (
                            <div className="space-y-2">
                              {comment.attachments.map((attachment) => (
                                <CommentAttachment
                                  key={attachment.id}
                                  attachment={attachment}
                                  getFileIcon={getFileIcon}
                                  setPreviewAttachment={setPreviewAttachment}
                                />
                              ))}
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          <Separator className="my-6" />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium">Add a comment</h3>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="internal-comment"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label htmlFor="internal-comment" className="text-sm">
                    Mark as internal comment
                  </label>
                </div>
              )}
            </div>

            <Textarea
              placeholder="Type your comment here... Use @ to mention someone"
              className="mb-3 min-h-[120px] focus-visible:ring-primary"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              ref={commentInputRef}
            />

            <div
              className={`mb-4 rounded-md border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/30"
                  : "border-muted-foreground/50 bg-primary/5"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Paperclip className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  Drag & Drop your files here
                </p>
                <p className="text-xs text-muted-foreground">or</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse files
                </Button>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Supported formats: PNG, JPG, GIF, PDF, DOC, DOCX, XLS, XLSX,
                  TXT
                </p>
              </div>
            </div>

            {isUploading && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {selectedFiles.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="text-sm font-medium">
                  Attachments ({selectedFiles.length})
                </h4>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-secondary/30 p-2 dark:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                className="gap-2"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting || isUploading}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Comment
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {previewAttachment && (
        <Dialog
          open={!!previewAttachment}
          onOpenChange={() => setPreviewAttachment(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewAttachment.name}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img
                src={previewAttachment.url}
                alt={previewAttachment.name}
                className="h-auto w-full rounded-md"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface CommentAttachmentProps {
  attachment: TicketCommentAttachment;
  getFileIcon: (type: string) => JSX.Element;
  setPreviewAttachment: (
    preview: {
      id: string;
      url: string;
      name: string;
    } | null,
  ) => void;
}

function CommentAttachment({
  attachment,
  getFileIcon,
  setPreviewAttachment,
}: CommentAttachmentProps) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-secondary/30 p-2 transition-colors hover:bg-secondary/50 dark:bg-slate-800/70 dark:hover:bg-slate-800">
      {getFileIcon(attachment.fileType)}
      <span className="flex-1 truncate text-sm">{attachment.fileName}</span>
      <span className="text-xs text-muted-foreground">
        {(attachment.fileSize / 1024).toFixed(0)} KB
      </span>
      <div className="flex items-center gap-1">
        {attachment.fileType.startsWith("image/") && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setPreviewAttachment({
                    id: attachment.id,
                    url: attachment.fileUrl,
                    name: attachment.fileName,
                  })
                }
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
          </Dialog>
        )}
        <Button
          variant="ghost"
          type="button"
          size="icon"
          className="h-7 w-7"
          onClick={() => window.open(attachment.fileUrl, "_blank")}
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
