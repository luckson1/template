import { z } from "zod";
import { OrganizationRole } from "@prisma/client";

export const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url("Invalid website URL").optional(),
  ownerId: z.string().optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")

    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),

  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional(),
});

export const updateOrganizationSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  logo: z.string().url().optional().nullable(),
  website: z.string().url().optional().nullable(),
  billingEmail: z.string().email("Invalid email format").optional().nullable(),
  billingName: z.string().optional().nullable(),
});

export const getOrganizationByIdSchema = z.object({
  id: z.string(),
});

export const getOrganizationBySlugSchema = z.object({
  slug: z.string(),
});

export const getUserOrganizationsSchema = z.object({
  userId: z.string().cuid().optional(),
});

// Schema for adding a user to an organization
export const addUserToOrganizationSchema = z.object({
  userId: z.string().cuid("Invalid user ID").optional(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]).default("MEMBER"),
});

export type IOrganization = z.infer<typeof organizationSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type IAddUserToOrganization = z.infer<
  typeof addUserToOrganizationSchema
>;

// Schema for inviting a user
export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(OrganizationRole).default(OrganizationRole.MEMBER),
});

// Schema for accepting an invitation
export const acceptInvitationSchema = z.object({
  token: z.string(),
});

// Schema for revoking an invitation
export const revokeInvitationSchema = z.object({
  id: z.string(),
});

// Schema for removing a user
export const removeUserSchema = z.object({
  userId: z.string(),
});

// Schema for updating a user's role
export const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(OrganizationRole),
});

// Schema for setting default organization
export const setDefaultOrganizationSchema = z.object({
  organizationId: z.string(),
});

// Schema for getting invitation by token
export const getInvitationByTokenSchema = z.object({
  token: z.string(),
});

// Schema for rejecting an invitation
export const rejectInvitationSchema = z.object({
  token: z.string(),
});

// Schema for deleting an organization
export const deleteOrganizationSchema = z.object({
  id: z.string(),
});

// Add new types if needed
export type IInviteUser = z.infer<typeof inviteUserSchema>;
export type IAcceptInvitation = z.infer<typeof acceptInvitationSchema>;
export type IRevokeInvitation = z.infer<typeof revokeInvitationSchema>;
export type IRemoveUser = z.infer<typeof removeUserSchema>;
export type IUpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type ISetDefaultOrganization = z.infer<
  typeof setDefaultOrganizationSchema
>;
export type IGetInvitationByToken = z.infer<typeof getInvitationByTokenSchema>;
export type IRejectInvitation = z.infer<typeof rejectInvitationSchema>;
export type IDeleteOrganization = z.infer<typeof deleteOrganizationSchema>;
