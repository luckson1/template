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
import { Loader2, CheckCircle, AlertCircle, XCircle } from "lucide-react";

export default function InvitationPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [organizationLogo, setOrganizationLogo] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [inviterImage, setInviterImage] = useState<string | null>(null);
  const [inviteeEmail, setInviteeEmail] = useState<string | null>(null);
  const [invitationStatus, setInvitationStatus] =
    useState<InvitationStatus | null>(null);

  // Query to get invitation details
  const getInvitationDetails =
    api.organization.getInvitationByToken.useMutation({
      onSuccess: (data) => {
        if (data) {
          setOrganizationName(data.organization?.name || null);
          setOrganizationLogo(data.organization?.logo || null);
          setInviterName(data.inviter?.name || null);
          setInviterImage(data.inviter?.image || null);
          setInviteeEmail(data.email);
          setInvitationStatus(data.status as InvitationStatus);
        } else {
          setError("Invalid invitation token");
        }
      },
      onError: (error) => {
        setError(error.message || "Failed to load invitation details");
      },
    });

  // Mutation to accept invitation
  const acceptInvitation = api.organization.acceptInvitation.useMutation({
    onSuccess: () => {
      toast.success(
        `You've successfully joined ${organizationName || "the organization"}`,
      );
      router.push("/dashboard");
    },
    onError: (error) => {
      setError(error.message || "Failed to accept invitation");
      setIsLoading(false);
    },
  });

  // Fetch invitation details on component mount
  useEffect(() => {
    if (token) {
      getInvitationDetails.mutate({ token });
    } else {
      setError("Invalid invitation link");
    }
  }, [token]);

  const handleAcceptInvitation = () => {
    if (!token) return;

    setIsLoading(true);
    acceptInvitation.mutate({ token });
  };

  // Loading state while fetching invitation details
  if (getInvitationDetails.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-center text-muted-foreground">
              Loading invitation details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle different invitation statuses
  let statusIcon = null;
  if (error) {
    statusIcon = <AlertCircle className="h-10 w-10 text-destructive" />;
  } else if (invitationStatus === InvitationStatus.ACCEPTED) {
    statusIcon = <CheckCircle className="text-success h-10 w-10" />;
  } else if (
    invitationStatus === InvitationStatus.EXPIRED ||
    invitationStatus === InvitationStatus.REVOKED
  ) {
    statusIcon = <XCircle className="h-10 w-10 text-destructive" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="mx-auto w-full max-w-md">
        {/* Organization Logo/Avatar */}
        <div className="-mt-10 flex justify-center">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={organizationLogo || undefined} />
            <AvatarFallback className="bg-primary text-xl text-primary-foreground">
              {organizationName?.charAt(0) || "O"}
            </AvatarFallback>
          </Avatar>
        </div>

        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {error
              ? "Invitation Error"
              : organizationName
                ? `Invitation to join ${organizationName}`
                : "Organization Invitation"}
          </CardTitle>
          <CardDescription>
            {error
              ? error
              : inviterName
                ? `${inviterName} has invited you to collaborate`
                : "You've been invited to join an organization"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusIcon && (
            <div className="mb-4 flex flex-col items-center gap-4">
              {statusIcon}
              {invitationStatus === InvitationStatus.ACCEPTED && (
                <p className="text-center text-sm text-muted-foreground">
                  You have already accepted this invitation
                </p>
              )}
            </div>
          )}

          {!error && invitationStatus === InvitationStatus.PENDING && (
            <div className="space-y-4">
              {inviteeEmail && (
                <div className="rounded-md bg-muted p-4 text-center">
                  <p className="text-sm font-medium">
                    This invitation was sent to
                  </p>
                  <p className="text-primary">{inviteeEmail}</p>
                </div>
              )}
              <p className="text-center text-muted-foreground">
                Click the button below to accept the invitation and join{" "}
                {organizationName ? (
                  <span className="font-medium">{organizationName}</span>
                ) : (
                  "the organization"
                )}
                .
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!error && invitationStatus === InvitationStatus.PENDING && (
            <Button
              onClick={handleAcceptInvitation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                `Accept Invitation${organizationName ? ` to ${organizationName}` : ""}`
              )}
            </Button>
          )}
          {(error || invitationStatus !== InvitationStatus.PENDING) && (
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Return to Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
