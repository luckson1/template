"use client";

import { type LucideIcon } from "lucide-react";
import { ChevronsUpDown, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import React from "react";

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  external?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  groups?: NavGroup[];
}

// Default navigation configuration
const defaultNavGroups: NavGroup[] = [
  {
    items: [
      {
        title: "Account",
        href: "/account",
        icon: User,
      },
      {
        title: "Sign out",
        icon: LogOut,
        onClick: () => {
          // Handle sign out logic here
          console.log("Sign out clicked");
        },
      },
    ],
  },
];

function NavMenuItem({ item }: { item: NavItem }) {
  const router = useRouter();
  const Icon = item.icon;
  const content = (
    <>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{item.title}</span>
    </>
  );

  // For items with onClick handlers (like sign out)
  if (item.onClick && !item.href) {
    return (
      <DropdownMenuItem onClick={item.onClick}>{content}</DropdownMenuItem>
    );
  }

  // For items with href (navigation links)
  if (item.href) {
    const href = item.href; // Create a local variable to satisfy TypeScript
    const handleClick = () => {
      if (item.external) {
        window.open(href, "_blank", "noopener,noreferrer");
      } else {
        router.push(href);
      }
    };

    return <DropdownMenuItem onClick={handleClick}>{content}</DropdownMenuItem>;
  }

  // Fallback for items without href or onClick
  return <DropdownMenuItem>{content}</DropdownMenuItem>;
}

export function NavUser({ user, groups = defaultNavGroups }: NavUserProps) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            {groups.map((group, groupIndex) => (
              <React.Fragment key={`nav-group-${groupIndex}`}>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  {group.items.map((item, itemIndex) => (
                    <NavMenuItem
                      key={`nav-item-${groupIndex}-${itemIndex}`}
                      item={item}
                    />
                  ))}
                </DropdownMenuGroup>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
