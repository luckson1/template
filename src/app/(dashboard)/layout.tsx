"use client";
import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
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
import {
  Building2,
  Home,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { NavUser, type NavGroup } from "@/components/NavUser";
import { NavMain } from "@/components/NavMain";
import {
  defaultSidebarConfig,
  getPageTitleFromPath,
  type SidebarConfig,
} from "@/config/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebarConfig?: SidebarConfig;
}

export default function DashboardLayout({
  children,
  sidebarConfig = defaultSidebarConfig,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pageTitle = getPageTitleFromPath(pathname, sidebarConfig);

  // useEffect(() => {
  //   // If the user is not signed in and the session is fully loaded, redirect to login
  //   if (status === "unauthenticated") {
  //     router.push("/login");
  //   }
  // }, [status, router]);

  // Show loading state while checking authentication
  // if (status === "loading") {
  //   return (
  //     <div className="flex h-screen w-full items-center justify-center">
  //       <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  //     </div>
  //   );
  // }

  // // Don't render the dashboard until we know the user is authenticated
  // if (status !== "authenticated") {
  //   return null;
  // }

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
  };

  // Navigation items with collapsible settings
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart3,
      isActive: pathname === "/analytics",
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
      isActive: pathname === "/customers",
    },

    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      isActive: pathname.startsWith("/settings"),
      items: [
        {
          title: "Account",
          url: "/account",
          isActive: pathname === "/account",
        },
        // {
        //   title: "Notifications",
        //   url: "/settings/notifications",
        //   isActive: pathname === "/settings/notifications",
        // },
        // {
        //   title: "Preferences",
        //   url: "/settings/preferences",
        //   isActive: pathname === "/settings/preferences",
        // },
        {
          title: "Billing",
          url: "/billing",
          isActive: pathname === "/billing",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "Help & Support",
      url: "/support",
      icon: HelpCircle,
      isActive: pathname === "/support",
    },
  ];

  // Custom navigation configuration for user dropdown
  const customNavGroups: NavGroup[] = [
    {
      items: [
        {
          title: "Account Settings",
          href: "/account",
          icon: Settings,
        },
        {
          title: "Billing",
          href: "/billing",
          icon: CreditCard,
        },
        {
          title: "Help & Support",
          href: "/support",
          icon: HelpCircle,
        },
        {
          title: "Sign out",
          icon: LogOut,
          onClick: () => {
            console.log("Custom logout handler");
            // Add your logout logic here
          },
        },
      ],
    },
  ];

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
          </div>
          <div className="w-full p-6">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
