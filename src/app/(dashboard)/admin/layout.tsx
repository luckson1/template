import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { isSystemAdmin } from "@/lib/system-roles";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Redirect if not a system admin
  if (!isSystemAdmin(session.user)) {
    redirect("/dashboard");
  }

  return <div className="flex min-h-screen flex-col">{children}</div>;
}
