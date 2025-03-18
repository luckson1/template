"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone, AlertCircle, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { FileUpload } from "@/components/FileUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TicketCategory, TicketPriority } from "@prisma/client";
import { Progress } from "@/components/ui/progress";
import { useOrganization } from "@/hooks/useOrganization";
// Import React Hook Form and resolver
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTicketSchema } from "@/server/api/schemas/support.schema";
import type { ICreateTicket } from "@/server/api/schemas/support.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";

export default function SupportPage() {
  const router = useRouter();
  const {
    uploadFiles,
    isUploading,
    uploadProgress,
    error: uploadError,
  } = useFileUpload();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganization();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize React Hook Form with Zod validation
  const form = useForm<ICreateTicket>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      subject: "",
      message: "",
      category: undefined,
      priority: undefined,
      organizationId: selectedOrg?.id ?? "",
    },
  });

  // Get recent tickets
  const { data: recentTickets, isLoading: isLoadingTickets } =
    api.support.listTickets.useQuery(
      { organizationId: selectedOrg?.id, limit: 5 },

      { enabled: true, refetchOnWindowFocus: false },
    );

  // Create ticket mutation
  const utils = api.useUtils();
  const createTicket = api.support.createTicket.useMutation({
    onSuccess: () => {
      toast.success("Support ticket submitted", {
        description: "We'll get back to you as soon as possible.",
      });
      resetForm();
      void utils.support.listTickets.invalidate();
    },
    onError: (error) => {
      toast.error("Error submitting ticket", {
        description: error.message || "Please try again later.",
      });
      setIsSubmitting(false);
    },
  });

  // Add attachment mutation
  const addAttachment = api.support.addAttachment.useMutation({
    onError: (error) => {
      toast.error("Error adding attachment", {
        description: error.message || "Failed to attach files to your ticket.",
      });
    },
  });

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleFileRemoved = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ICreateTicket) => {
    if (!selectedOrg) {
      toast.error("Organization required", {
        description: "Please select an organization first.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure organizationId is set
      const ticketData = {
        ...data,
        organizationId: selectedOrg.id,
      };

      // First, create the ticket
      const ticketResult = await createTicket.mutateAsync(ticketData);

      // If there are files, upload them to Vercel Blob
      if (selectedFiles.length > 0) {
        const uploadedFiles = await uploadFiles(selectedFiles);

        // Add each file as an attachment to the ticket
        await Promise.all(
          uploadedFiles.map((file) =>
            addAttachment.mutateAsync({
              ticketId: ticketResult.id,
              fileName: file.fileName,
              fileSize: file.size,
              fileType: file.contentType,
              fileUrl: file.url,
            }),
          ),
        );
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectedFiles([]);
  };

  const isFormDisabled = isSubmitting || isUploading || isLoadingOrg;

  // Update form value when organization changes
  React.useEffect(() => {
    if (selectedOrg) {
      form.setValue("organizationId", selectedOrg.id);
    }
  }, [selectedOrg, form]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Get help and connect with our support team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Submit a support ticket and we&apos;ll get back to you as soon
                  as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingOrg ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted"></div>
                    </div>
                  </div>
                ) : !selectedOrg ? (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" /> No organization found.
                      Please create or join an organization first.
                    </p>
                  </div>
                ) : null}

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief description of your issue"
                          disabled={isFormDisabled}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        disabled={isFormDisabled}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BUG">Bug Report</SelectItem>
                          <SelectItem value="FEATURE_REQUEST">
                            Feature Request
                          </SelectItem>
                          <SelectItem value="PERFORMANCE">
                            Performance Issue
                          </SelectItem>
                          <SelectItem value="UI_UX">UI/UX Feedback</SelectItem>
                          <SelectItem value="DOCUMENTATION">
                            Documentation
                          </SelectItem>
                          <SelectItem value="SECURITY">
                            Security Concern
                          </SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        disabled={isFormDisabled}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LOW">
                            Low - General question or feedback
                          </SelectItem>
                          <SelectItem value="MEDIUM">
                            Medium - Issue affecting my work
                          </SelectItem>
                          <SelectItem value="HIGH">
                            High - Serious problem
                          </SelectItem>
                          <SelectItem value="CRITICAL">
                            Critical - System unusable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you've tried so far."
                          rows={6}
                          disabled={isFormDisabled}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel htmlFor="attachments">
                    Attachments (optional)
                  </FormLabel>
                  <FileUpload
                    onFilesSelected={handleFilesSelected}
                    onFileRemoved={handleFileRemoved}
                    selectedFiles={selectedFiles}
                    isUploading={isUploading}
                    maxFiles={5}
                    maxSizeMB={5}
                  />
                  {uploadError && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" /> {uploadError}
                    </p>
                  )}
                  {isUploading && (
                    <div className="space-y-2">
                      <Progress
                        value={uploadProgress}
                        className="h-2 bg-[#f5f0ff]"
                        indicatorClassName="bg-[#7c3aed]"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#9f7aea]">
                          Uploading files...
                        </p>
                        <p className="text-xs font-medium text-[#7c3aed]">
                          {uploadProgress}%
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {Array.from({
                          length: Math.min(selectedFiles.length, 2),
                        }).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 rounded-md border border-[#9f7aea]/30 bg-[#f5f0ff]/50 p-2"
                          >
                            <div className="h-10 w-10 animate-pulse rounded-md bg-[#9f7aea]/20"></div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="h-4 w-3/4 animate-pulse rounded-md bg-[#9f7aea]/20"></div>
                              <div className="h-3 w-1/2 animate-pulse rounded-md bg-[#9f7aea]/20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {!selectedOrg && !isLoadingOrg && (
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" /> Organization is
                      required
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isFormDisabled || !selectedOrg}>
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Ticket"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alternative Contact Methods</CardTitle>
              <CardDescription>
                Other ways to reach our support team:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingOrg ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-5 w-5 animate-pulse rounded-md bg-muted"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-3 w-48 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-3 w-40 animate-pulse rounded-md bg-muted"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">
                        {siteConfig.support.email.address}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Response time: {siteConfig.support.email.responseTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone Support</p>
                      <p className="text-sm text-muted-foreground">
                        {siteConfig.support.phone.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {siteConfig.support.phone.availability}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Live Chat</p>
                      <p className="text-sm text-muted-foreground">
                        {siteConfig.support.liveChat.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {siteConfig.support.liveChat.availability}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTickets ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="space-y-2">
                        <div className="h-4 w-48 animate-pulse rounded-md bg-muted"></div>
                        <div className="h-3 w-32 animate-pulse rounded-md bg-muted"></div>
                      </div>
                      <div className="h-6 w-20 animate-pulse rounded-full bg-muted"></div>
                    </div>
                  ))}
                </div>
              ) : recentTickets?.tickets.length ? (
                <div className="space-y-4">
                  {recentTickets.tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/tickets/${ticket.id}`}
                      className="block"
                    >
                      <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50">
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            Opened{" "}
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            ticket.status === "RESOLVED" ? "outline" : "default"
                          }
                          className={
                            ticket.status === "RESOLVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : ""
                          }
                        >
                          {ticket.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  You haven&apos;t submitted any tickets yet.
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => router.push("/tickets")}
                disabled={isLoadingTickets}
              >
                {isLoadingTickets ? (
                  <div className="h-4 w-24 animate-pulse rounded-md bg-muted"></div>
                ) : (
                  "View All Tickets"
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
