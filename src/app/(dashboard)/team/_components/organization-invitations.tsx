"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Invitation } from "@prisma/client";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, UserPlus } from "lucide-react";
import { InviteMemberDialog } from "./invite-member-dialog";
import { useRouter } from "next/navigation";

interface InvitationWithInviter extends Invitation {
  inviter: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface OrganizationInvitationsProps {
  invitations: InvitationWithInviter[];
  organizationId: string;
}

export function OrganizationInvitations({
  invitations,
  organizationId,
}: OrganizationInvitationsProps) {
  const router = useRouter();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const revokeInvitation = api.organization.revokeInvitation.useMutation({
    onSuccess: () => {
      toast.success("Invitation revoked successfully");
      router.refresh();
      setIsLoading(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to revoke invitation. Try again");
      setIsLoading(null);
    },
  });

  const handleRevokeInvitation = (id: string) => {
    if (confirm("Are you sure you want to revoke this invitation?")) {
      setIsLoading(id);
      revokeInvitation.mutate({ id });
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invitation?token=${token}`;
    void navigator.clipboard.writeText(inviteUrl);
    toast.success("Invitation link copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">
          Pending Invitations ({invitations.length})
        </h3>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {invitations.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{invitation.email}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {invitation.role.toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invitation.inviter.name ?? invitation.inviter.email}
                </TableCell>
                <TableCell>
                  {new Date(invitation.expiresAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(invitation.token)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    disabled={isLoading === invitation.id}
                  >
                    {isLoading === invitation.id ? "Revoking..." : "Revoke"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No pending invitations</h3>
          <p className="mt-2 text-muted-foreground">
            Invite team members to collaborate with you
          </p>
          <Button className="mt-4" onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      )}

      <InviteMemberDialog
        organizationId={organizationId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
}
