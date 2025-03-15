import { db } from "@/server/db";
import type { User } from "@prisma/client";

/**
 * Generate a slug from a string
 * @param input String to generate slug from
 * @returns Slugified string
 */
export function generateSlug(input: string): string {
  // Remove special characters, replace spaces with dashes, and convert to lowercase
  const baseSlug = input
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Add a random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Create a default organization for a user
 * @param user User to create organization for
 * @returns Created organization
 */
export async function createDefaultOrganization(user: User) {
  if (!user.email && !user.name) {
    throw new Error(
      "User must have an email or name to create an organization",
    );
  }

  // Generate organization name from user's name or email
  const orgName = user.name ?? user.email?.split("@")[0] ?? "My Organization";

  // Generate a slug from the organization name
  const slug = generateSlug(orgName);

  // Create the organization
  const organization = await db.organization.create({
    data: {
      name: orgName,
      slug,
      ownerId: user.id,
      // Create the user-organization relationship with OWNER role
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
    include: {
      members: true,
    },
  });

  // Update the user's defaultOrganizationId
  await db.user.update({
    where: { id: user.id },
    data: { defaultOrganizationId: organization.id },
  });

  return organization;
}
