import {
  Home,
  Users,
  Settings,
  FileText,
  ShoppingCart,
  BarChart,
  HelpCircle,
  LogOut,
  CreditCard,
  Shield,
} from "lucide-react";
import { type SidebarConfig, type NavItem } from "@/config/sidebar";

/**
 * Example of a custom sidebar configuration for an e-commerce admin dashboard
 */
export const ecommerceNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    group: "Overview",
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart,
    group: "Overview",
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: ShoppingCart,
    items: [
      {
        title: "All Products",
        url: "/dashboard/products/all",
      },
      {
        title: "Add New",
        url: "/dashboard/products/new",
      },
      {
        title: "Categories",
        url: "/dashboard/products/categories",
      },
    ],
    group: "Store Management",
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: FileText,
    group: "Store Management",
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
    group: "Store Management",
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    items: [
      {
        title: "Store",
        url: "/dashboard/settings/store",
      },
      {
        title: "Payments",
        url: "/dashboard/settings/payments",
        icon: CreditCard,
      },
      {
        title: "Team",
        url: "/dashboard/settings/team",
        icon: Users,
      },
    ],
    group: "Administration",
  },
  {
    title: "Help & Support",
    url: "/dashboard/support",
    icon: HelpCircle,
    group: "Administration",
  },
];

// For backward compatibility
export const ecommerceAdminSidebar: SidebarConfig = {
  groups: [
    {
      title: "Overview",
      items: ecommerceNavItems.filter((item) => item.group === "Overview"),
    },
    {
      title: "Store Management",
      items: ecommerceNavItems.filter(
        (item) => item.group === "Store Management",
      ),
    },
    {
      title: "Administration",
      items: ecommerceNavItems.filter(
        (item) => item.group === "Administration",
      ),
    },
  ],
};

/**
 * Example of a minimal sidebar configuration
 */
export const minimalNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    group: "Main",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    items: [
      {
        title: "Account",
        url: "/account",
      },
      {
        title: "Preferences",
        url: "/preferences",
      },
    ],
    group: "Configuration",
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    group: "Configuration",
  },
];

// For backward compatibility
export const minimalSidebar: SidebarConfig = {
  groups: [
    {
      title: "Main",
      items: minimalNavItems.filter((item) => item.group === "Main"),
    },
    {
      title: "Configuration",
      items: minimalNavItems.filter((item) => item.group === "Configuration"),
    },
  ],
};
