import {
  Home,
  Settings,
  Users,
  CreditCard,
  HelpCircle,
  Shield,
} from "lucide-react";
import { type Session } from "next-auth";
import { isSystemAdmin } from "@/lib/system-roles";

export interface NavItem {
  title: string;
  url: string; // Changed from href to url for consistency
  icon?: React.ComponentType<{ className?: string }>; // Changed to Component type
  isActive?: boolean;
  items?: NavItem[];
  group?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface SidebarConfig {
  groups: NavGroup[];
}

// Central navigation definition that can be used anywhere in the app
export function getNavigationItems(pathname: string, session: Session | null) {
  const isAdmin = isSystemAdmin(session?.user);

  // Navigation items with proper grouping
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
      group: "Main", // Adding a group property for Dashboard
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      isActive:
        pathname.startsWith("/settings") ||
        pathname === "/account" ||
        pathname === "/billing" ||
        pathname === "/team",
      items: [
        {
          title: "Account",
          url: "/account",
          isActive: pathname === "/account",
        },
        {
          title: "Billing",
          url: "/billing",
          isActive: pathname === "/billing",
          icon: CreditCard,
        },
        {
          title: "Team",
          url: "/team",
          isActive: pathname === "/team",
          icon: Users,
        },
      ],
      group: "Settings", // Adding a group property for Settings
    },
    {
      title: "Help & Support",
      url: "/support",
      icon: HelpCircle,
      isActive: pathname === "/support",
      group: "Settings", // Adding Help & Support to the Settings group
    },
  ];

  // Add admin section for system admins
  if (isAdmin) {
    navItems.push({
      title: "Admin",
      url: "/admin",
      icon: Shield,
      isActive: pathname.startsWith("/admin"),
      items: [
        {
          title: "User Management",
          url: "/admin/users",
          isActive: pathname === "/admin/users",
        },
      ],
      group: "Admin", // Adding a group property for Admin
    });
  }

  return navItems;
}

// Create a backward compatible config for existing components
export function getSidebarConfig(
  pathname: string,
  session: Session | null,
): SidebarConfig {
  const navItems = getNavigationItems(pathname, session);

  // Group items by their 'group' property
  const mainItems = navItems.filter((item) => item.group === "Main");
  const settingsItems = navItems.filter((item) => item.group === "Settings");
  const adminItems = navItems.filter((item) => item.group === "Admin");

  const groups = [
    {
      title: "Main",
      items: mainItems,
    },
  ];

  if (settingsItems.length > 0) {
    groups.push({
      title: "Settings",
      items: settingsItems,
    });
  }

  if (adminItems.length > 0) {
    groups.push({
      title: "Admin",
      items: adminItems,
    });
  }

  return {
    groups,
  };
}

// Helper function to get page title from pathname
export function getPageTitleFromPath(
  pathname: string,
  navItems: NavItem[] = getNavigationItems(pathname, null),
): string {
  // Function to recursively search for matching item
  function findMatchingItem(items: NavItem[]): string | null {
    for (const item of items) {
      if (item.url === pathname) {
        return item.title;
      }

      // Check sub-items if they exist
      if (item.items && item.items.length > 0) {
        const match = findMatchingItem(item.items);
        if (match) return match;
      }
    }

    return null;
  }

  // Find the matching item
  const title = findMatchingItem(navItems);

  // Return the title if found, otherwise default to "Dashboard"
  return title ?? "Dashboard";
}
