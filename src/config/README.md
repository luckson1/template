# Configuration System

This directory contains configuration files for customizing various aspects of the application.

## Site Configuration

The site-wide settings and metadata can be customized by modifying the configuration in `site.ts`.

### Usage

The site configuration is exported as `siteConfig`. You can import and use it throughout your application:

```tsx
import { siteConfig } from "@/config/site";

// Example: Using site name in a component
function Footer() {
  return (
    <footer>
      <p>
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </footer>
  );
}
```

### Configuration Structure

The site configuration includes:

- Basic information (name, description, URL)
- SEO metadata (title, keywords)
- Open Graph metadata for social sharing
- Twitter Card metadata
- Social media links
- Application details:
  - Category and operating system
  - Screenshots with dimensions
  - Pricing information
  - Features list
  - Rating information

### Application Details

The `application` section of the configuration contains details specific to your application:

```tsx
// Example: Using application details in a component
function AppInfo() {
  return (
    <div>
      <h2>Features</h2>
      <ul>
        {siteConfig.application.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>

      <h2>Pricing</h2>
      <p>
        {siteConfig.application.pricing.value}{" "}
        {siteConfig.application.pricing.currency}(
        {siteConfig.application.pricing.model})
      </p>
    </div>
  );
}
```

This information is also used to generate structured data (JSON-LD) for better SEO.

### Customizing for Your Project

When using this template for your own project, update the values in `site.ts` to match your project's details.

## Sidebar Configuration

The sidebar navigation can be customized by modifying the configuration in `sidebar.tsx`.

### Usage

The application uses a centralized navigation system through the `getNavigationItems` function in `sidebar.tsx`:

```tsx
import { usePathname } from "next/navigation";
import { getNavigationItems } from "@/config/sidebar";
import { type Session } from "next-auth";

// In a component or hook
function MyComponent({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const navItems = getNavigationItems(pathname, session);

  // Use navItems for rendering
}
```

### Creating Custom Navigation

You can create your own custom navigation items by following the NavItem structure:

```tsx
// Example: Creating custom navigation items
import { Home, Settings, Users } from "lucide-react";
import { type NavItem } from "@/config/sidebar";

export const myCustomNavItems: NavItem[] = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Users",
    url: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    items: [
      {
        title: "Account",
        url: "/dashboard/settings/account",
      },
      {
        title: "Security",
        url: "/dashboard/settings/security",
      },
    ],
  },
];
```

### Example Configurations

We've provided some example navigation configurations in the `examples` directory:

1. `ecommerceNavItems` - Navigation items for an e-commerce admin dashboard
2. `minimalNavItems` - A minimal navigation with just essential items

You can import and use these in your custom components:

```tsx
import { ecommerceNavItems } from "@/config/examples/custom-sidebar";
import { NavMain } from "@/components/NavMain";

export function CustomNavigation() {
  return <NavMain items={ecommerceNavItems} groupTitle="E-commerce" />;
}
```

### Configuration Structure

The navigation configuration follows this structure:

```typescript
interface NavItem {
  title: string; // Display text for the navigation item
  url: string; // URL path for the navigation item (used to be href)
  icon?: React.ComponentType<{ className?: string }>; // Icon component type
  isActive?: boolean; // Whether the item is currently active
  items?: NavItem[]; // Optional sub-items for dropdown/collapsible navigation
  group?: string; // Group this item belongs to for sidebar organization
}
```

Each navigation item requires:

- `title`: The text to display
- `url`: The URL path
- `icon` (optional): A Lucide icon component type
- `isActive` (optional): Boolean to indicate if the item is currently active
- `items` (optional): Array of sub-items for nested navigation
- `group` (optional): String identifier for the group this item belongs to

The `getNavigationItems` function in `sidebar.tsx` automatically sets the `isActive` property based on the current pathname, so you don't need to manage that manually in most cases.

### Grouped Navigation Structure

Navigation items are automatically grouped in the sidebar based on their `group` property. Items with the same group value will be displayed together under the same group header.

Example of creating grouped navigation items:

```tsx
import { Home, Settings, HelpCircle } from "lucide-react";
import { type NavItem } from "@/config/sidebar";

const groupedNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    group: "Main", // This item will appear in the "Main" group
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    group: "Configuration", // This item will appear in the "Configuration" group
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
    group: "Configuration", // This item will also appear in the "Configuration" group
  },
];
```

The `getSidebarConfig` function automatically organizes these items into proper groups for display in the sidebar.
