"use client";
import { Settings, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { NavGroup } from "@/components/NavUser";

// Define a consistent structure for user navigation
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
      title: "Settings",
      items: [
        {
          title: "Account",
          href: "/account",
          icon: Settings,
        },
        {
          title: "Billing",
          href: "/billing",
          icon: CreditCard,
        },
        {
          title: "Support",
          href: "/support",
          icon: HelpCircle,
        },
      ],
    },
    {
      items: [
        {
          title: "Sign out",
          icon: LogOut,
          onClick: () => {
            void signOut({ callbackUrl: "/" });
          },
        },
      ],
    },
  ];

  return { user, customNavGroups };
}
