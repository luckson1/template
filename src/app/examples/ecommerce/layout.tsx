"use client";

import { type ReactNode } from "react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { ecommerceAdminSidebar } from "@/config/examples/custom-sidebar";

export default function EcommerceLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout sidebarConfig={ecommerceAdminSidebar}>
      {children}
    </DashboardLayout>
  );
}
