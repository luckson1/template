"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Building2 } from "lucide-react";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AddOrganizationModal } from "@/components/organization/AddOrganizationModal";

// Define the organization type based on the API response
type Organization =
  RouterOutputs["organization"]["getUserOrganizations"][number];

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { data, isLoading } = api.organization.getUserOrganizations.useQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  );

  // Add state for the modal
  const [addOrgModalOpen, setAddOrgModalOpen] = React.useState(false);



  // Safely handle the data
  const organizations = React.useMemo(() => data ?? [], [data]);
  const [activeOrg, setActiveOrg] = React.useState<Organization | null>(null);

  // Set the active organization when data is loaded
  React.useEffect(() => {
    if (organizations.length > 0 && !activeOrg) {
      const firstOrg = organizations[0];
      if (firstOrg) {
        setActiveOrg(firstOrg);
      }
    }
  }, [organizations, activeOrg]);

  // Loading state
  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex w-full items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-16" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  // No organizations
  if (organizations.length === 0) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setAddOrgModalOpen(true)}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Plus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Create Organization
                </span>
                <span className="truncate text-xs">Get started</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Add Organization Modal */}
        <AddOrganizationModal
          open={addOrgModalOpen}
          onOpenChange={setAddOrgModalOpen}
        />
      </>
    );
  }

  if (!activeOrg) {
    return null;
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* Use the logo if available, otherwise use a default icon */}
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrg.name}
                  </span>
                  <span className="truncate text-xs">{activeOrg.plan}</span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Organizations
              </DropdownMenuLabel>
              {organizations.map((org, index) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setActiveOrg(org)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Building2 className="size-4 shrink-0" />
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 p-2"
                onClick={() => setAddOrgModalOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Add Organization Modal */}
      <AddOrganizationModal
        open={addOrgModalOpen}
        onOpenChange={setAddOrgModalOpen}
      />
    </>
  );
}
