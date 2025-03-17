import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { defaultSidebarConfig, type SidebarConfig } from "@/config/sidebar";
import { auth } from "@/server/auth";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarConfig?: SidebarConfig;
}

export default async function DashboardLayout({
  children,
  sidebarConfig = defaultSidebarConfig,
}: DashboardLayoutProps) {
  // Check if user is authenticated
  const session = await auth();

  // If not authenticated, sredirect to login page
  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardClient session={session} sidebarConfig={sidebarConfig}>
      {children}
    </DashboardClient>
  );
}
