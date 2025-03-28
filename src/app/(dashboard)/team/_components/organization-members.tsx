"use client";

import { useState } from "react";
import { toast } from "sonner";
import { OrganizationRole } from "@prisma/client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MoreHorizontal, UserPlus } from "lucide-react";
import { InviteMemberDialog } from "./invite-member-dialog";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: OrganizationRole;
  joinedAt: Date;
}

interface OrganizationMembersProps {
  members: Member[];
  organizationId: string;
  currentUserId: string;
  isOwner: boolean;
}

export function OrganizationMembers({
  members,
  organizationId,
  currentUserId,
  isOwner,
}: OrganizationMembersProps) {
  const router = useRouter();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const utils = api.useUtils();

  const removeUser = api.organization.removeUser.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully");
      void utils.organization.getMembers.invalidate({ organizationId });
      router.refresh();
      setIsLoading(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove member");
      setIsLoading(null);
    },
  });

  const updateUserRole = api.organization.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Member role updated successfully");
      void utils.organization.getMembers.invalidate({ organizationId });
      router.refresh();
      setIsLoading(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update member role");
      setIsLoading(null);
    },
  });

  const handleRemoveUser = (userId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      setIsLoading(userId);
      removeUser.mutate({ organizationId, userId });
    }
  };

  const handleUpdateRole = (userId: string, role: OrganizationRole) => {
    setIsLoading(userId);
    updateUserRole.mutate({ organizationId, userId, role });
  };

  const handleLeaveOrganization = () => {
    if (
      confirm(
        "Are you sure you want to leave this organization? You will lose access to all resources.",
      )
    ) {
      setIsLoading(currentUserId);
      removeUser.mutate({ organizationId, userId: currentUserId });
    }
  };

  const getRoleBadgeColor = (role: OrganizationRole) => {
    switch (role) {
      case "OWNER":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "ADMIN":
        return "bg-blue-500 hover:bg-blue-600";
      case "MEMBER":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Members ({members.length})</h3>
        <Button
          onClick={() => setIsInviteDialogOpen(true)}
          disabled={!isOwner && members.every((m) => m.role !== "ADMIN")}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={member.image ?? undefined} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {isOwner && member.id !== currentUserId ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`${getRoleBadgeColor(member.role)}`}
                        disabled={isLoading === member.id}
                      >
                        {member.role}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {Object.values(OrganizationRole)
                        .filter((role) => role !== "OWNER")
                        .map((role) => (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => handleUpdateRole(member.id, role)}
                          >
                            {role}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge
                    className={`${getRoleBadgeColor(member.role)} text-white`}
                  >
                    {member.role}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(member.joinedAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                {member.id === currentUserId
                  ? member.role !== "OWNER" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLeaveOrganization}
                        disabled={isLoading === member.id}
                      >
                        {isLoading === member.id ? "Leaving..." : "Leave"}
                      </Button>
                    )
                  : isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading === member.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRemoveUser(member.id)}
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InviteMemberDialog
        organizationId={organizationId}
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </div>
  );
}
