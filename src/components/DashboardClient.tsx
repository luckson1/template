"use client";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Building2 } from "lucide-react";
import { NavUser } from "@/components/NavUser";
import { NavMain } from "@/components/NavMain";
import { getPageTitleFromPath, type SidebarConfig } from "@/config/sidebar";
import { useNavigationItems } from "./NavigationItems";
import { useUserNavigation } from "./UserNavigation";

interface DashboardClientProps {
  children: ReactNode;
  sidebarConfig: SidebarConfig;
}

export function DashboardClient({
  children,
  sidebarConfig,
}: DashboardClientProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitleFromPath(pathname, sidebarConfig);
  const navItems = useNavigationItems();
  const { user, customNavGroups } = useUserNavigation();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2">
              <Building2 className="h-6 w-6" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={navItems} groupTitle="Main" />
          </SidebarContent>
          <SidebarFooter>
            <div className="px-2 py-2">
              <NavUser user={user} groups={customNavGroups} />
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="sticky top-0 z-10 flex w-full items-center justify-between rounded-t-lg border-b bg-background p-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">{pageTitle}</h1>
            </div>
            <div className="flex items-center">
              <NavUser user={user} groups={customNavGroups} iconOnly={true} />
            </div>
          </div>
          <div className="w-full p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
