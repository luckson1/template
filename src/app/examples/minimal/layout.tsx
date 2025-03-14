"use client";

import { type ReactNode } from "react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { minimalSidebar } from "@/config/examples/custom-sidebar";

export default function MinimalLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout sidebarConfig={minimalSidebar}>{children}</DashboardLayout>
  );
}
