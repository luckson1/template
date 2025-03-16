"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/react";

// Define the organization type based on the API response
type Organization =
  RouterOutputs["organization"]["getUserOrganizations"][number];

/**
 * Custom hook for managing organization selection via URL parameters
 *
 * @returns An object containing:
 * - selectedOrgId: The currently selected organization ID from URL params
 * - organizations: Array of user's organizations
 * - selectedOrg: The currently selected organization object
 * - setSelectedOrg: Function to update the selected organization
 * - isLoading: Boolean indicating if organizations are loading
 */
export function useOrganization() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current user data
  const { data: userData } = api.user.getCurrentUser.useQuery();

  // Get user's organizations
  const { data: userOrgsData, isLoading } =
    api.organization.getUserOrganizations.useQuery(
      {},
      {
        refetchOnWindowFocus: false,
      },
    );

  // Get organization ID from URL params
  const selectedOrgId = searchParams.get("orgId");

  // Safely handle the data with useMemo to prevent recreation on every render
  const organizations = useMemo(() => userOrgsData ?? [], [userOrgsData]);

  // Find the selected organization based on the URL param
  const selectedOrg = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId) ?? null,
    [organizations, selectedOrgId],
  );

  // Update URL when changing organization
  const setSelectedOrg = useCallback(
    (orgId: string) => {
      const params = new URLSearchParams(searchParams);
      params.set("orgId", orgId);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams],
  );

  // Set default organization when data is loaded
  useEffect(() => {
    if (
      selectedOrgId &&
      organizations.some((org) => org.id === selectedOrgId)
    ) {
      // URL param exists and is valid, no need to update
      return;
    }

    // Otherwise set default org in URL
    if (
      userData?.defaultOrganizationId &&
      organizations.some((org) => org.id === userData.defaultOrganizationId)
    ) {
      setSelectedOrg(userData.defaultOrganizationId);
    } else if (organizations.length > 0 && organizations[0]?.id) {
      setSelectedOrg(organizations[0].id);
    }
  }, [userData, organizations, selectedOrgId, setSelectedOrg]);

  return {
    selectedOrgId,
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading,
  };
}
