"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InvitationStatus } from "@prisma/client";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  LogIn,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { TRPCClientError } from "@trpc/client";

// Define type-safe status string literals
type InvitationStatusStrings =
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED"
  | "REVOKED"
  | "REJECTED";

export default function InvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailMismatch, setEmailMismatch] = useState(false);

  // Fetch invitation details with useQuery (only when user is authenticated)
  const {
    data: invitationData,
    isLoading: isLoadingInvitation,
    error: queryError,
  } = api.organization.getInvitationByToken.useQuery(
    { token },
    {
      enabled: !!token && sessionStatus === "authenticated",
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  // Check for email mismatch when both session and invitationData are available
  useEffect(() => {
    if (
      invitationData &&
      session?.user?.email &&
      invitationData.email !== session.user.email
    ) {
      setEmailMismatch(true);
    }
  }, [invitationData, session]);

  // Handle query errors
  useEffect(() => {
    if (queryError) {
      const errorMessage =
        queryError instanceof TRPCClientError
          ? queryError.message
          : "Failed to load invitation details";
      setError(errorMessage);
    }
  }, [queryError]);

  // Mutation to accept invitation
  const acceptInvitation = api.organization.acceptInvitation.useMutation({
    onSuccess: () => {
      toast.success(
        `You've successfully joined ${invitationData?.organization?.name ?? "the organization"}`,
      );
      router.push("/dashboard");
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        setError(error.message ?? "Failed to accept invitation");
      } else {
        setError("Failed to accept invitation");
      }
      setIsLoading(false);
    },
  });

  // Mutation to reject invitation
  const rejectInvitation = api.organization.rejectInvitation.useMutation({
    onSuccess: () => {
      toast.success("Invitation rejected");
      router.push("/dashboard");
    },
    onError: (error) => {
      if (error instanceof TRPCClientError) {
        toast.error(error.message ?? "Failed to reject invitation");
      } else {
        toast.error("Failed to reject invitation");
      }
      setIsLoading(false);
    },
  });

  const handleAcceptInvitation = () => {
    if (!token) return;
    setIsLoading(true);
    acceptInvitation.mutate({ token });
  };

  const handleRejectInvitation = () => {
    if (!token) return;
    setIsLoading(true);
    rejectInvitation.mutate({ token });
  };

  const handleSignInRedirect = () => {
    // Redirect to login page, passing the current invitation URL as callback
    const callbackUrl = `/invitation/${token}`;
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  // Loading state
  if (
    sessionStatus === "loading" ||
    (sessionStatus === "authenticated" && isLoadingInvitation)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              {sessionStatus === "loading"
                ? "Checking your session..."
                : "Loading invitation details..."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle not authenticated state
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="mx-auto w-full max-w-md">
          <div className="-mt-10 flex justify-center">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                O
              </AvatarFallback>
            </Avatar>
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in Required</CardTitle>
            <CardDescription>
              Please sign in or create an account to view and accept this
              invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                You need to be signed in to accept organization invitations.
                Please sign in or create an account to continue.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleSignInRedirect} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In / Sign Up to Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Get invitation status as string for safer comparison
  const invitationStatus = invitationData?.status as
    | InvitationStatusStrings
    | undefined;

  // Handle different invitation statuses
  let statusIcon = null;
  if (error) {
    statusIcon = <AlertCircle className="h-10 w-10 text-destructive" />;
  } else if (invitationStatus === "ACCEPTED") {
    statusIcon = <CheckCircle className="text-success h-10 w-10" />;
  } else if (
    invitationStatus === "EXPIRED" ||
    invitationStatus === "REVOKED" ||
    invitationStatus === "REJECTED"
  ) {
    statusIcon = <XCircle className="h-10 w-10 text-destructive" />;
  }

  // Helper function to build the organization name text
  const getOrganizationText = (prefix = "", suffix = "") => {
    const orgName = invitationData?.organization?.name;
    if (!orgName) return "";
    return `${prefix}${orgName}${suffix}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto w-full max-w-md">
        {/* Organization Logo/Avatar */}
        <div className="-mt-10 flex justify-center">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage
              src={invitationData?.organization?.logo ?? undefined}
            />
            <AvatarFallback className="bg-primary text-xl text-primary-foreground">
              {invitationData?.organization?.name?.charAt(0) ?? "O"}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {error
              ? "Invitation Error"
              : invitationData?.organization?.name
                ? `Invitation to join ${invitationData.organization.name}`
                : "Organization Invitation"}
          </CardTitle>
          <CardDescription>
            {(error ?? invitationData?.inviter?.name)
              ? `${invitationData?.inviter.name} has invited you to collaborate`
              : "You've been invited to join an organization"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusIcon && (
            <div className="mb-4 flex flex-col items-center gap-4">
              {statusIcon}
              {invitationStatus === "ACCEPTED" && (
                <p className="text-center text-sm text-muted-foreground">
                  You have already accepted this invitation
                </p>
              )}
              {(invitationStatus === "EXPIRED" ||
                invitationStatus === "REVOKED") && (
                <p className="text-center text-sm text-muted-foreground">
                  This invitation is no longer valid
                </p>
              )}
              {invitationStatus === "REJECTED" && (
                <p className="text-center text-sm text-muted-foreground">
                  You have rejected this invitation
                </p>
              )}
            </div>
          )}

          {emailMismatch && (
            <div className="mb-4 space-y-2 rounded-md border border-destructive p-4">
              <p className="text-center font-medium text-destructive">
                Email Mismatch
              </p>
              <p className="text-center text-sm text-muted-foreground">
                This invitation was sent to{" "}
                <span className="font-medium">{invitationData?.email}</span>,
                but you are signed in as{" "}
                <span className="font-medium">{session?.user?.email}</span>.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Please sign in with the correct email address or ask for a new
                invitation.
              </p>
            </div>
          )}

          {!error && !emailMismatch && invitationStatus === "PENDING" && (
            <div className="space-y-4">
              {invitationData?.email && (
                <div className="rounded-md bg-muted p-4 text-center">
                  <p className="text-sm font-medium">
                    This invitation was sent to
                  </p>
                  <p className="text-primary">{invitationData.email}</p>
                </div>
              )}
              <p className="text-center text-muted-foreground">
                You can accept this invitation to join{" "}
                {invitationData?.organization?.name ?? "the organization"} or
                reject it.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {!error && !emailMismatch && invitationStatus === "PENDING" && (
            <>
              <Button
                onClick={handleAcceptInvitation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && acceptInvitation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  `Accept Invitation${getOrganizationText(" to ")}`
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleRejectInvitation}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && rejectInvitation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  "Reject Invitation"
                )}
              </Button>
            </>
          )}
          {(error ?? emailMismatch ?? invitationStatus !== "PENDING") && (
            <Button
              variant="outline"
              onClick={() => router.push(session ? "/dashboard" : "/")}
              className="w-full"
            >
              {session ? "Go to Dashboard" : "Return to Home"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
