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

The default sidebar configuration is exported as `defaultSidebarConfig`. You can use it as is, or create your own custom configuration:

```tsx
// Example: Creating a custom sidebar configuration
import { Home, Settings, Users } from "lucide-react";
import { SidebarConfig } from "@/config/sidebar";

export const mySidebarConfig: SidebarConfig = {
  groups: [
    {
      title: "My Custom Group",
      items: [
        {
          title: "Home",
          href: "/dashboard",
          icon: <Home className="h-4 w-4" />,
          tooltip: "Home",
        },
        {
          title: "Users",
          href: "/dashboard/users",
          icon: <Users className="h-4 w-4" />,
          tooltip: "Users",
        },
      ],
    },
    {
      title: "Admin",
      items: [
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-4 w-4" />,
          tooltip: "Settings",
        },
      ],
    },
  ],
};
```

### Using Custom Configuration

You can pass your custom configuration to the `DashboardLayout` component:

```tsx
// In your app/some-page/layout.tsx
import { mySidebarConfig } from "@/path/to/your/config";
import DashboardLayout from "@/app/dashboard/layout";

export default function CustomLayout({ children }) {
  return (
    <DashboardLayout sidebarConfig={mySidebarConfig}>
      {children}
    </DashboardLayout>
  );
}
```

### Example Configurations

We've provided some example configurations in the `examples` directory:

1. `ecommerceAdminSidebar` - A sidebar configuration for an e-commerce admin dashboard
2. `minimalSidebar` - A minimal sidebar with just essential navigation items

You can import and use these examples:

```tsx
import { ecommerceAdminSidebar } from "@/config/examples/custom-sidebar";
import DashboardLayout from "@/app/dashboard/layout";

export default function EcommerceLayout({ children }) {
  return (
    <DashboardLayout sidebarConfig={ecommerceAdminSidebar}>
      {children}
    </DashboardLayout>
  );
}
```

### Configuration Structure

The sidebar configuration follows this structure:

```typescript
interface NavItem {
  title: string; // Display text for the navigation item
  href: string; // URL path for the navigation item
  icon: ReactNode; // Icon component to display
  tooltip?: string; // Optional tooltip text
}

interface NavGroup {
  title: string; // Group title
  items: NavItem[]; // Navigation items in this group
}

interface SidebarConfig {
  groups: NavGroup[]; // Groups of navigation items
  footerLinks?: NavItem[]; // Optional footer navigation items
}
```

Each navigation item requires:

- `title`: The text to display
- `href`: The URL path
- `icon`: A React component (typically a Lucide icon)
- `tooltip` (optional): Text to show on hover

Navigation items are organized into groups, each with a title.
