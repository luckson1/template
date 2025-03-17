import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";
import { isSystemAdmin } from "@/lib/system-roles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, Users } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
  description: "System administration dashboard",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect if not a system admin
  if (!isSystemAdmin(session.user)) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            System-wide administration tools and settings
          </p>
        </div>
        <Shield className="h-12 w-12 text-primary/20" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">User Management</CardTitle>
            <CardDescription>
              Manage system users and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-primary/50" />
              <Button asChild>
                <Link href="/admin/users">Manage Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
