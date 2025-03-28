"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Invitation, InvitationStatus, OrganizationRole } from "@prisma/client";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, XCircle, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface InvitationWithInviter extends Invitation {
  inviter: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface PendingInvitesProps {
  invitations: InvitationWithInviter[];
  organizationId: string;
  isAdmin: boolean;
}

export default function PendingInvites({
  invitations,
  organizationId,
  isAdmin,
}: PendingInvitesProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = api.useUtils();

  // Filter invitations based on search query
  const filteredInvitations = invitations.filter((invitation) =>
    invitation.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle search input change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await utils.organization.getPendingInvitations.invalidate({
      organizationId,
    });
    router.refresh();
    setIsRefreshing(false);
  };

  // Handle revoking an invitation
  const useRevokeInvitation = (organizationId: string) => {
    const router = useRouter();
    const utils = api.useUtils();
    const revokeInvitation = api.organization.revokeInvitation.useMutation({
      onSuccess: () => {
        toast.success("Invitation successfully revoked");
        void utils.organization.getPendingInvitations.invalidate({
          organizationId,
        });
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to revoke invitation. Try again");
      },
    });

    return (id: string) => {
      revokeInvitation.mutate({ id });
    };
  };

  const handleRevokeInvite = useRevokeInvitation(organizationId);

  // Handle copying invite link
  const handleCopyInviteLink = (token: string) => {
    const inviteLink = `${window.location.origin}/invitation/${token}`;
    void navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard");
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get badge variant based on role
  const getRoleBadgeVariant = (role: OrganizationRole) => {
    switch (role) {
      case "ADMIN":
        return "secondary";
      case "OWNER":
        return "default";
      default:
        return "outline";
    }
  };

  // Format role name for display
  const formatRole = (role: OrganizationRole) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "MEMBER":
        return "Member";
      case "OWNER":
        return "Owner";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invitations..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Invited By</TableHead>
            <TableHead>Expires</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvitations.length > 0 ? (
            filteredInvitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell>{invitation.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={getRoleBadgeVariant(invitation.role)}
                    className="px-2 py-0"
                  >
                    {formatRole(invitation.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invitation.inviter.name ?? invitation.inviter.email}
                </TableCell>
                <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                {isAdmin && (
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyInviteLink(invitation.token)}
                      title="Copy invite link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Revoke invitation"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke invitation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke the invitation for{" "}
                            {invitation.email}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeInvite(invitation.id)}
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                {searchQuery
                  ? "No matching invitations found"
                  : "No pending invitations"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
