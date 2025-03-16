import { z } from "zod";

export const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url("Invalid website URL").optional(),
  ownerId: z.string().optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").optional(),
  logo: z.string().optional(),
  website: z.string().url().optional(),
});

export const getOrganizationByIdSchema = z.object({
  id: z.string().cuid(),
});

export const getUserOrganizationsSchema = z.object({
  userId: z.string().cuid().optional(),
});

// Schema for adding a user to an organization
export const addUserToOrganizationSchema = z.object({
  organizationId: z.string().cuid("Invalid organization ID"),
  userId: z.string().cuid("Invalid user ID").optional(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]).default("MEMBER"),
});

export type IOrganization = z.infer<typeof organizationSchema>;
export type ICreateOrganization = z.infer<typeof createOrganizationSchema>;
export type IAddUserToOrganization = z.infer<
  typeof addUserToOrganizationSchema
>;
