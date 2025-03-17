import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import TeamManagementClient from "./_components/team-management-client";

export const metadata = {
  title: "Team Management",
  description: "Manage your team members and invitations",
};

async function TeamManagementPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <TeamManagementClient currentUserId={session.user.id} />;
}

export default function TeamManagementPageWrapper() {
  return (
    <Suspense
      fallback={
        <Card className="mx-auto w-full max-w-4xl bg-white">
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[500px]" />
          </CardContent>
        </Card>
      }
    >
      <TeamManagementPage />
    </Suspense>
  );
}
