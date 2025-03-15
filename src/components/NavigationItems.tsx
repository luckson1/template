"use client";
import { usePathname } from "next/navigation";
import { Home, CreditCard, Settings, HelpCircle } from "lucide-react";

export function useNavigationItems() {
  const pathname = usePathname();

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
      ],
    },
    {
      title: "Help & Support",
      url: "/support",
      icon: HelpCircle,
      isActive: pathname === "/support",
    },
  ];

  return navItems;
}
