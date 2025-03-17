// Define a type that captures the minimum properties needed to check system roles
type UserWithSystemRole = {
  systemRole?: string;
};

/**
 * Check if a user has system admin privileges (ADMIN role)
 */
export function isSystemAdmin(user?: UserWithSystemRole | null): boolean {
  if (!user?.systemRole) return false;
  return user.systemRole === "ADMIN";
}

/**
 * Check if a user has support team privileges (SUPPORT or ADMIN role)
 */
export function isSystemSupport(user?: UserWithSystemRole | null): boolean {
  if (!user?.systemRole) return false;
  return user.systemRole === "SUPPORT" || user.systemRole === "ADMIN";
}

/**
 * Check if a user has admin or support privileges (ADMIN or SUPPORT role)
 */
export function isSystemStaff(user?: UserWithSystemRole | null): boolean {
  return isSystemAdmin(user) || isSystemSupport(user);
}
