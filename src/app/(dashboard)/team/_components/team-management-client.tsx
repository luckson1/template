"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusIcon, UserX } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

import { useOrganization } from "@/hooks/useOrganization";
import { api } from "@/trpc/react";
import CurrentTeam from "./current-team";
import PendingInvites from "./pending-invites";
import InviteMembers from "./invite-members";

interface TeamManagementClientProps {
  currentUserId: string;
}

export default function TeamManagementClient({
  currentUserId,
}: TeamManagementClientProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const { organizations, selectedOrg, isLoading } = useOrganization();

  // Fetch members for the selected organization
  const { data: members = [], isLoading: isMembersLoading } =
    api.organization.getMembers.useQuery();

  // Fetch pending invitations - only fetch if user is admin or owner
  const currentUserMember = members.find(
    (member) => member.id === currentUserId,
  );
  const isOwner = selectedOrg?.ownerId === currentUserId;
  const isAdmin = currentUserMember?.role === "ADMIN" || isOwner;

  const { data: invitations = [], isLoading: isInvitationsLoading } =
    api.organization.getPendingInvitations.useQuery();
  const numOfOrgs = organizations.length;
  const hasOrgs = numOfOrgs > 0;

  // Redirect to organization create page if no organizations
  useEffect(() => {
    if (!hasOrgs && !isMembersLoading && !isLoading) {
      router.push("/team/create");
    }
  }, [hasOrgs, isMembersLoading, router, isLoading]);

  if (isMembersLoading || isInvitationsLoading || isLoading) {
    return (
      <Card className="mx-auto w-full max-w-4xl bg-white">
        <CardContent className="p-10">
          <Skeleton className="mb-4 h-10 w-full" />
          <Skeleton className="mb-2 h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </Card>
    );
  }
  if (!selectedOrg && !isLoading) {
    return (
      <Card className="mx-auto w-full max-w-4xl bg-white">
        <CardContent className="p-10 text-center">
          <UserX className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No organization selected</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please select an organization to manage its team.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="mx-auto w-full max-w-4xl bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-2xl font-bold">
              Team Management
            </CardTitle>
          </div>
          <CardDescription>
            Manage your team members and invitations
          </CardDescription>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Invite People
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-auto w-full max-w-xl">
              {selectedOrg && (
                <InviteMembers
                  organizationId={selectedOrg.id}
                  onInviteSent={() => setOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current-team" className="w-full">
          {isAdmin && (
            <TabsList
              className={`mx-auto mb-6 grid w-full max-w-sm grid-cols-2`}
            >
              <>
                <TabsTrigger value="current-team">Current Team</TabsTrigger>
                <TabsTrigger value="pending-invites">
                  Pending Invites
                </TabsTrigger>
              </>
            </TabsList>
          )}
          <TabsContent value="current-team">
            {selectedOrg && (
              <CurrentTeam
                members={members}
                organizationId={selectedOrg.id}
                currentUserId={currentUserId}
                isOwner={isOwner}
                isAdmin={isAdmin}
              />
            )}
          </TabsContent>
          {isAdmin && (
            <>
              <TabsContent value="pending-invites">
                {selectedOrg && (
                  <PendingInvites
                    invitations={invitations}
                    organizationId={selectedOrg.id}
                    isAdmin={isAdmin}
                  />
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
