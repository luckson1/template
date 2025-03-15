"use client";
import { Settings, CreditCard, HelpCircle, LogOut } from "lucide-react";
import type { NavGroup } from "@/components/NavUser";

export function useUserNavigation() {
  // User data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://github.com/shadcn.png",
  };

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

  return { user, customNavGroups };
}
