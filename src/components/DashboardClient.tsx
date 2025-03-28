"use client";
import { type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/NavUser";
import { NavMain } from "@/components/NavMain";
import { getPageTitleFromPath, getSidebarConfig } from "@/config/sidebar";
import { useNavigationItems } from "./NavigationItems";
import { useUserNavigation } from "./UserNavigation";
import { type User } from "next-auth";
import { TeamSwitcher } from "./TeamSwitcher";
import { type Session } from "next-auth";

interface DashboardClientProps {
  children: ReactNode;
  session: Session;
}

export function DashboardClient({ children, session }: DashboardClientProps) {
  const pathname = usePathname();
  const navItems = useNavigationItems(session);
  const pageTitle = getPageTitleFromPath(pathname, navItems);
  const user = session.user;
  const { customNavGroups } = useUserNavigation();
  const sidebarConfig = getSidebarConfig(pathname, session);

  return (
    <SessionProvider session={session}>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
              <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
              {sidebarConfig.groups.map((group, index) => (
                <NavMain
                  key={`nav-group-${index}`}
                  items={group.items}
                  groupTitle={group.title}
                />
              ))}
            </SidebarContent>
            <SidebarFooter>
              <div className="px-2 py-2">
                <NavUser user={user} groups={customNavGroups} />
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="bg-accent">
            <div className="b sticky top-0 z-10 flex w-full items-center justify-between rounded-t-lg border-b p-4">
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
    </SessionProvider>
  );
}
