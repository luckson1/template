import {
  BarChart3,
  Home,
  Settings,
  Users,
  CreditCard,
  HelpCircle,
  LogOut,
  Building,
} from "lucide-react";
import { type ReactNode } from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  tooltip?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarConfig {
  groups: NavGroup[];
  footerLinks?: NavItem[];
}

// Default sidebar configuration
export const defaultSidebarConfig: SidebarConfig = {
  groups: [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <Home className="h-4 w-4" />,
          tooltip: "Dashboard",
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: <BarChart3 className="h-4 w-4" />,
          tooltip: "Analytics",
        },
        {
          title: "Customers",
          href: "/customers",
          icon: <Users className="h-4 w-4" />,
          tooltip: "Customers",
        },
        {
          title: "Billing",
          href: "/billing",
          icon: <CreditCard className="h-4 w-4" />,
          tooltip: "Billing",
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Organization",
          href: "/organization",
          icon: <Building className="h-4 w-4" />,
          tooltip: "Organization Settings",
        },
        {
          title: "Account",
          href: "/account",
          icon: <Settings className="h-4 w-4" />,
          tooltip: "Account Settings",
        },
        {
          title: "Help & Support",
          href: "/help",
          icon: <HelpCircle className="h-4 w-4" />,
          tooltip: "Help",
        },
      ],
    },
  ],
};

// Helper function to get page title from pathname
export function getPageTitleFromPath(
  pathname: string,
  config: SidebarConfig = defaultSidebarConfig,
): string {
  // Flatten all items from all groups
  const allItems = config.groups.flatMap((group) => group.items);

  // Find the matching item
  const matchingItem = allItems.find((item) => item.href === pathname);

  // Return the title if found, otherwise default to "Dashboard"
  return matchingItem?.title ?? "Dashboard";
}
