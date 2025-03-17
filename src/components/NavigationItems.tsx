"use client";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  Settings,
  HelpCircle,
  Shield,
  Users,
} from "lucide-react";
import { isSystemAdmin } from "@/lib/system-roles";
import { type Session } from "next-auth";

export function useNavigationItems(session: Session | null) {
  const pathname = usePathname();

  const isAdmin = isSystemAdmin(session?.user);

  // Navigation items with collapsible settings
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
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
    },
    {
      title: "Help & Support",
      url: "/support",
      icon: HelpCircle,
      isActive: pathname === "/support",
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
    });
  }

  return navItems;
}
