import {
  Home,
  Users,
  Settings,
  FileText,
  ShoppingCart,
  BarChart,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { type SidebarConfig } from "@/config/sidebar";

/**
 * Example of a custom sidebar configuration for an e-commerce admin dashboard
 */
export const ecommerceAdminSidebar: SidebarConfig = {
  groups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <Home className="h-4 w-4" />,
          tooltip: "Dashboard",
        },
        {
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: <BarChart className="h-4 w-4" />,
          tooltip: "Analytics",
        },
      ],
    },
    {
      title: "Store Management",
      items: [
        {
          title: "Products",
          href: "/dashboard/products",
          icon: <ShoppingCart className="h-4 w-4" />,
          tooltip: "Products",
        },
        {
          title: "Orders",
          href: "/dashboard/orders",
          icon: <FileText className="h-4 w-4" />,
          tooltip: "Orders",
        },
        {
          title: "Customers",
          href: "/dashboard/customers",
          icon: <Users className="h-4 w-4" />,
          tooltip: "Customers",
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-4 w-4" />,
          tooltip: "Settings",
        },
        {
          title: "Help & Support",
          href: "/dashboard/support",
          icon: <HelpCircle className="h-4 w-4" />,
          tooltip: "Help",
        },
        {
          title: "Sign Out",
          href: "/logout",
          icon: <LogOut className="h-4 w-4" />,
          tooltip: "Sign Out",
        },
      ],
    },
  ],
};

/**
 * Example of a minimal sidebar configuration
 */
export const minimalSidebar: SidebarConfig = {
  groups: [
    {
      title: "Navigation",
      items: [
        {
          title: "Home",
          href: "/dashboard",
          icon: <Home className="h-4 w-4" />,
          tooltip: "Home",
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-4 w-4" />,
          tooltip: "Settings",
        },
        {
          title: "Sign Out",
          href: "/logout",
          icon: <LogOut className="h-4 w-4" />,
          tooltip: "Sign Out",
        },
      ],
    },
  ],
};
