"use client";

import { useState } from "react";
import type { SystemRole } from "@prisma/client";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  systemRole: SystemRole;
  createdAt: Date;
};

export function UsersTable({ users }: { users: User[] }) {
  const [optimisticUsers, setOptimisticUsers] = useState<User[]>(users);

  const { mutate: updateUserSystemRole } =
    api.admin.updateUserSystemRole.useMutation({
      onSuccess: (updatedUser) => {
        toast.success(
          `Updated ${updatedUser.name ?? updatedUser.email}'s role to ${updatedUser.systemRole}`,
        );

        // Update the optimistic state
        setOptimisticUsers((prev) =>
          prev.map((user) =>
            user.id === updatedUser.id
              ? { ...user, systemRole: updatedUser.systemRole }
              : user,
          ),
        );
      },
      onError: (error) => {
        toast.error(`Failed to update role: ${error.message}`);
      },
    });

  const handleRoleChange = (userId: string, newRole: SystemRole) => {
    updateUserSystemRole({ userId, systemRole: newRole });
  };

  const getRoleBadgeColor = (role: SystemRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "SUPPORT":
        return "bg-blue-100 text-blue-800";
      case "USER":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Change Role</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optimisticUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? ""}
                  />
                  <AvatarFallback>
                    {user.name?.charAt(0) ?? user.email?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <span>{user.name ?? "Unnamed User"}</span>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleBadgeColor(user.systemRole)}>
                  {user.systemRole}
                </Badge>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.systemRole}
                  onValueChange={(value) =>
                    handleRoleChange(user.id, value as SystemRole)
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="SUPPORT">Support</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {format(new Date(user.createdAt), "MMM d, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
