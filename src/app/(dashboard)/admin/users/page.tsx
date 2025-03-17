import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { isSystemAdmin } from "@/lib/system-roles";
import { auth } from "@/server/auth";
import { UsersTable } from "./components/UsersTable";

export const metadata = {
  title: "Admin - User Management",
  description: "Manage system users and roles",
};

export default async function AdminUsersPage() {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect if not a system admin
  if (!isSystemAdmin(session.user)) {
    redirect("/dashboard");
  }

  // Fetch all users
  const users = await api.admin.getUsers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">System User Management</h1>
      <p className="mb-6 text-muted-foreground">
        Manage system-wide roles for all users. System roles provide
        platform-level permissions that apply across all organizations.
      </p>

      <UsersTable users={users} />
    </div>
  );
}
