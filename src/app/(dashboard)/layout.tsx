import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { auth } from "@/server/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // Check if user is authenticated
  const session = await auth();

  // If not authenticated, redirect to login page
  if (!session) {
    redirect("/login");
  }

  return <DashboardClient session={session}>{children}</DashboardClient>;
}
