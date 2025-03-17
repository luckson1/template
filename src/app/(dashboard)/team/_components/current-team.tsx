"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OrganizationRole } from "@prisma/client";
import { api } from "@/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, MoreHorizontal, Search } from "lucide-react";
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

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: OrganizationRole;
  joinedAt: Date;
}

interface CurrentTeamProps {
  members: Member[];
  organizationId: string;
  currentUserId: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export default function CurrentTeam({
  members,
  organizationId,
  currentUserId,
  isOwner,
  isAdmin,
}: CurrentTeamProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<OrganizationRole | "ALL">("ALL");
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // tRPC mutations
  const removeUser = api.organization.removeUser.useMutation({
    onSuccess: () => {
      toast.success("Member removed successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove member");
    },
  });

  const updateUserRole = api.organization.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  // Filter members based on search query and role filter
  const filteredMembers = members.filter(
    (member) =>
      (member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter === "ALL" || member.role === roleFilter),
  );

  const handleRemoveMember = (userId: string) => {
    removeUser.mutate({
      organizationId,
      userId,
    });
    setRemovingUserId(null);
  };

  const handleRoleChange = (userId: string, role: OrganizationRole) => {
    updateUserRole.mutate({
      organizationId,
      userId,
      role,
    });
  };

  const getBadgeVariant = (role: OrganizationRole) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "OWNER":
        return "destructive";
      default:
        return "secondary";
    }
  };

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOwnerRole = (role: OrganizationRole) => role === "OWNER";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Show statistics here if needed */}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {isAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={member.image ?? ""}
                    alt={member.name ?? ""}
                  />
                  <AvatarFallback>
                    {member.name?.[0] ?? member.email?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {member.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {isAdmin &&
                member.id !== currentUserId &&
                !isOwnerRole(member.role) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 gap-1 px-2">
                        <Badge
                          variant={getBadgeVariant(member.role)}
                          className="px-2 py-0"
                        >
                          {formatRole(member.role)}
                        </Badge>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, "MEMBER")}
                      >
                        Member
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRoleChange(member.id, "ADMIN")}
                      >
                        Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge
                    variant={getBadgeVariant(member.role)}
                    className="px-2 py-0"
                  >
                    {formatRole(member.role)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(member.joinedAt)}</TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  {member.id !== currentUserId && !isOwnerRole(member.role) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove team member
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            {member.name ?? member.email} from this
                            organization? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
