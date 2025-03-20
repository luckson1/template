"use client";

import { type ReactNode } from "react";
import DashboardLayout from "@/app/(dashboard)/layout";
import { minimalNavItems } from "@/config/examples/custom-sidebar";
import { getSidebarConfig } from "@/config/sidebar";
import { usePathname } from "next/navigation";

export default function MinimalLayout({ children }: { children: ReactNode }) {
  // Since this is a client component, we can't use session directly
  // Session will be fetched inside the DashboardLayout
  return <DashboardLayout>{children}</DashboardLayout>;
}
