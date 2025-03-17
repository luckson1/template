"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Organization } from "@prisma/client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface OrganizationDangerZoneProps {
  organization: Organization;
  isOwner: boolean;
}

export function OrganizationDangerZone({
  organization,
  isOwner,
}: OrganizationDangerZoneProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const deleteOrganization = api.organization.delete.useMutation({
    onSuccess: () => {
      toast.success("Organization deleted successfully");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete organization");
      setIsLoading(false);
    },
  });

  const handleDeleteOrganization = () => {
    if (confirmText !== organization.name) {
      toast.error("Organization name doesn't match");
      return;
    }

    setIsLoading(true);
    deleteOrganization.mutate({ id: organization.id });
  };

  return (
    <div className="space-y-4">
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle>Delete Organization</CardTitle>
          <CardDescription>
            Permanently delete this organization and all of its data. This
            action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This will delete the organization, all of its data, and remove all
            members. This action is permanent and cannot be undone.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={!isOwner}
          >
            Delete Organization
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Organization</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              organization and remove all members.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please type <strong>{organization.name}</strong> to confirm.
            </p>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm organization name</Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={organization.name}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrganization}
              disabled={
                confirmText !== organization.name || isLoading || !isOwner
              }
            >
              {isLoading ? "Deleting..." : "Delete Organization"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
