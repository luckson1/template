"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
// Removed unused imports: useSearchParams, useRouter, usePathname
import { api } from "@/trpc/react";

const LOCAL_STORAGE_ORG_KEY = "selectedOrgId";

/**
 * Custom hook for managing organization selection via localStorage
 *
 * @returns An object containing:
 * - selectedOrgId: The currently selected organization ID from localStorage
 * - organizations: Array of user's organizations
 * - selectedOrg: The currently selected organization object
 * - setSelectedOrg: Function to update the selected organization
 * - isLoading: Boolean indicating if organizations are loading
 */
export function useOrganization() {
  // State to hold the selected organization ID
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Get current user data
  const { data: userData } = api.user.getCurrentUser.useQuery();

  // Get user's organizations
  const { data: userOrgsData, isLoading } =
    api.organization.getUserOrganizations.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  // Safely handle the data with useMemo to prevent recreation on every render
  const organizations = useMemo(() => userOrgsData ?? [], [userOrgsData]);

  // Find the selected organization based on the state
  const selectedOrg = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId) ?? null,
    [organizations, selectedOrgId],
  );

  // Function to update the selected organization in state and localStorage
  const updateSelectedOrg = useCallback((orgId: string | null) => {
    setSelectedOrgId(orgId);
    if (typeof window !== "undefined") {
      if (orgId) {
        localStorage.setItem(LOCAL_STORAGE_ORG_KEY, orgId);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_ORG_KEY);
      }
    }
  }, []);

  // Effect to load initial orgId from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedOrgId = localStorage.getItem(LOCAL_STORAGE_ORG_KEY);
      // Set initial state only if it hasn't been set yet (prevents overriding during HMR etc.)
      // And only if the stored ID is actually valid within the loaded organizations later
      if (storedOrgId) {
        setSelectedOrgId(storedOrgId);
      }
    }
  }, []); // Run only once on mount

  // Effect to set default organization when data is loaded or changes
  useEffect(() => {
    // Only run if organizations have loaded
    if (isLoading || organizations.length === 0) {
      return;
    }

    const currentStoredOrgId =
      typeof window !== "undefined"
        ? localStorage.getItem(LOCAL_STORAGE_ORG_KEY)
        : null;
    const isValidStoredOrg = organizations.some(
      (org) => org.id === currentStoredOrgId,
    );

    // 1. If a valid orgId is already in localStorage and state, do nothing
    if (isValidStoredOrg && selectedOrgId === currentStoredOrgId) {
      return;
    }

    // 2. If localStorage has a valid org, but state doesn't match (e.g., initial load), update state
    if (isValidStoredOrg && selectedOrgId !== currentStoredOrgId) {
      setSelectedOrgId(currentStoredOrgId);
      return;
    }

    // 3. If localStorage is invalid/missing, try user's default
    let orgToSet: string | null = null;
    if (
      userData?.defaultOrganizationId &&
      organizations.some((org) => org.id === userData.defaultOrganizationId)
    ) {
      orgToSet = userData.defaultOrganizationId;
    }
    // 4. If no user default, use the first organization
    else if (organizations.length > 0 && organizations[0]?.id) {
      orgToSet = organizations[0].id;
    }

    // 5. Update state and localStorage if we found an org to set
    if (orgToSet && orgToSet !== selectedOrgId) {
      updateSelectedOrg(orgToSet);
    }
  }, [userData, organizations, isLoading, updateSelectedOrg, selectedOrgId]); // Re-run if user data, orgs, or loading state changes

  return {
    selectedOrgId,
    organizations,
    selectedOrg,
    setSelectedOrg: updateSelectedOrg, // Expose the combined update function
    isLoading,
  };
}
