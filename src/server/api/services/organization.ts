import { TRPCError } from "@trpc/server";
import {
  type PrismaClient,
  type Organization,
  type User,
  OrganizationRole,
  type Invitation,
  InvitationStatus,
} from "@prisma/client";
import {
  type CreateOrganization,
  type UpdateOrganization,
} from "../schemas/organization.schema";
import { type Session } from "next-auth";
import { emailService } from "../../services/email";

// Define a type that includes defaultOrganizationId
type UserWithDefaultOrg =
  | User
  | Session["user"]
  | (Session["user"] & { defaultOrganizationId?: string | null });

// Helper function to check if user has defaultOrganizationId property
const hasDefaultOrg = (
  user: UserWithDefaultOrg,
): user is UserWithDefaultOrg & { defaultOrganizationId: string | null } => {
  return "defaultOrganizationId" in user;
};

interface OrganizationServiceContext {
  user: UserWithDefaultOrg | null;
  db: PrismaClient;
}

export const organizationService = {
  /**
   * Create a default organization for a new user
   */
  createDefaultForUser: async ({
    userId,
    name,
    db,
  }: {
    userId: string;
    name?: string | null;
    db: PrismaClient;
  }): Promise<Organization> => {
    try {
      // Generate a default organization name
      const orgName = name ? `${name}'s Team` : "My Team";

      // Generate a slug from the organization name
      const slug = orgName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      // Create the organization in a transaction
      return await db.$transaction(async (tx) => {
        // Create the organization
        const organization = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            ownerId: userId,
          },
        });

        // Add the user as an OWNER
        await tx.userOrganization.create({
          data: {
            userId,
            organizationId: organization.id,
            role: OrganizationRole.OWNER,
          },
        });

        // Set as default organization for the user
        await tx.user.update({
          where: { id: userId },
          data: { defaultOrganizationId: organization.id },
        });

        return organization;
      });
    } catch (error) {
      console.error("Error creating default organization:", error);
      throw error;
    }
  },

  /**
   * Create a new organization
   */
  create: async ({
    user,
    db,
    input,
  }: OrganizationServiceContext & {
    input: CreateOrganization;
  }): Promise<Organization> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to create an organization",
      });
    }

    try {
      // Generate a slug if not provided
      const slug =
        input.slug ??
        input.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

      // Check if slug is already taken
      const existingOrg = await db.organization.findUnique({
        where: { slug },
      });

      if (existingOrg) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Organization slug already exists",
        });
      }

      // Create the organization in a transaction
      return await db.$transaction(async (tx) => {
        // Create the organization
        const organization = await tx.organization.create({
          data: {
            name: input.name,
            slug,
            logo: input.logo,
            website: input.website,
            ownerId: user.id,
          },
        });

        // Add the creator as an OWNER
        await tx.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: organization.id,
            role: OrganizationRole.OWNER,
          },
        });

        // Set as default organization if user doesn't have one
        if (!hasDefaultOrg(user) || user.defaultOrganizationId === null) {
          await tx.user.update({
            where: { id: user.id },
            data: { defaultOrganizationId: organization.id },
          });
        }

        return organization;
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create organization",
        cause: error,
      });
    }
  },

  /**
   * Get an organization by ID
   */
  getById: async ({
    user,
    db,
    id,
  }: OrganizationServiceContext & {
    id: string;
  }): Promise<Organization> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view an organization",
      });
    }

    try {
      // Check if user is a member of the organization
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: id,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this organization",
        });
      }

      const organization = await db.organization.findUnique({
        where: { id },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      return organization;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organization",
        cause: error,
      });
    }
  },

  /**
   * Get an organization by slug
   */
  getBySlug: async ({
    user,
    db,
    slug,
  }: OrganizationServiceContext & {
    slug: string;
  }): Promise<Organization> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view an organization",
      });
    }

    try {
      const organization = await db.organization.findUnique({
        where: { slug },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Check if user is a member of the organization
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: organization.id,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this organization",
        });
      }

      return organization;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organization",
        cause: error,
      });
    }
  },

  /**
   * Get all organizations for a user
   */
  getUserOrganizations: async ({
    user,
    db,
  }: OrganizationServiceContext): Promise<Organization[]> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view your organizations",
      });
    }

    try {
      const memberships = await db.userOrganization.findMany({
        where: { userId: user.id },
        include: { organization: true },
      });

      return memberships.map((m) => m.organization);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organizations",
        cause: error,
      });
    }
  },

  /**
   * Update an organization
   */
  update: async ({
    user,
    db,
    input,
  }: OrganizationServiceContext & {
    input: UpdateOrganization;
  }): Promise<Organization> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to update an organization",
      });
    }

    try {
      // Check if user has admin rights
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: input.id,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== OrganizationRole.ADMIN &&
          membership.role !== OrganizationRole.OWNER)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this organization",
        });
      }

      // Update the organization
      return await db.organization.update({
        where: { id: input.id },
        data: {
          name: input.name,
          logo: input.logo,
          website: input.website,
          billingEmail: input.billingEmail,
          billingName: input.billingName,
        },
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update organization",
        cause: error,
      });
    }
  },

  /**
   * Delete an organization
   */
  delete: async ({
    user,
    db,
    id,
  }: OrganizationServiceContext & {
    id: string;
  }): Promise<{ success: boolean }> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to delete an organization",
      });
    }

    try {
      // Check if user is the owner
      const organization = await db.organization.findUnique({
        where: { id },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      if (organization.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the organization owner can delete it",
        });
      }

      // Delete the organization
      await db.organization.delete({
        where: { id },
      });

      // If this was the user's default organization, set a new default if possible
      if (hasDefaultOrg(user) && user.defaultOrganizationId === id) {
        const anotherOrg = await db.userOrganization.findFirst({
          where: { userId: user.id },
          select: { organizationId: true },
        });

        if (anotherOrg) {
          await db.user.update({
            where: { id: user.id },
            data: { defaultOrganizationId: anotherOrg.organizationId },
          });
        } else {
          await db.user.update({
            where: { id: user.id },
            data: { defaultOrganizationId: null },
          });
        }
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete organization",
        cause: error,
      });
    }
  },

  /**
   * Invite a user to an organization
   */
  invite: async ({
    user,
    db,
    organizationId,
    email,
    role = OrganizationRole.MEMBER,
  }: OrganizationServiceContext & {
    organizationId: string;
    email: string;
    role?: OrganizationRole;
  }): Promise<Invitation> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to invite users",
      });
    }

    try {
      // Check if user has admin rights
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== OrganizationRole.ADMIN &&
          membership.role !== OrganizationRole.OWNER)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to invite users to this organization",
        });
      }

      // Check if organization exists
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Check if user is already a member
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        const existingMembership = await db.userOrganization.findUnique({
          where: {
            userId_organizationId: {
              userId: existingUser.id,
              organizationId,
            },
          },
        });

        if (existingMembership) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User is already a member of this organization",
          });
        }
      }

      // Check for existing pending invitation
      const existingInvitation = await db.invitation.findFirst({
        where: {
          email,
          organizationId,
          status: InvitationStatus.PENDING,
        },
      });

      if (existingInvitation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An invitation has already been sent to this email",
        });
      }

      // Create invitation with native crypto
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const invitation = await db.invitation.create({
        data: {
          email,
          token,
          status: InvitationStatus.PENDING,
          role,
          expiresAt,
          organizationId,
          inviterId: user.id,
        },
      });

      // Send invitation email
      await emailService.sendInvitation({
        inviterName: user.name ?? "A team member",
        inviterEmail: user.email ?? null,
        organizationName: organization.name,
        organizationLogo: organization.logo,
        invitationToken: token,
        role,
        expiresAt,
        recipientEmail: email,
      });

      return invitation;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create invitation",
        cause: error,
      });
    }
  },

  /**
   * Accept an invitation
   */
  acceptInvitation: async ({
    user,
    db,
    token,
  }: OrganizationServiceContext & {
    token: string;
  }): Promise<{ success: boolean }> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to accept an invitation",
      });
    }

    try {
      // Find the invitation
      const invitation = await db.invitation.findUnique({
        where: { token },
        include: { organization: true },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Check if invitation is valid
      if (invitation.status !== InvitationStatus.PENDING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invitation is ${invitation.status.toLowerCase()}`,
        });
      }

      if (invitation.expiresAt < new Date()) {
        await db.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      // Check if email matches
      if (invitation.email.toLowerCase() !== user.email?.toLowerCase()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This invitation was sent to a different email address",
        });
      }

      // Check if user is already a member
      const existingMembership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: invitation.organizationId,
          },
        },
      });

      if (existingMembership) {
        await db.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        });

        throw new TRPCError({
          code: "CONFLICT",
          message: "You are already a member of this organization",
        });
      }

      // Add user to organization
      await db.$transaction([
        db.userOrganization.create({
          data: {
            userId: user.id,
            organizationId: invitation.organizationId,
            role: invitation.role,
          },
        }),
        db.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.ACCEPTED },
        }),
      ]);

      // Set as default organization if user doesn't have one
      if (!hasDefaultOrg(user) || user.defaultOrganizationId === null) {
        await db.user.update({
          where: { id: user.id },
          data: { defaultOrganizationId: invitation.organizationId },
        });
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to accept invitation",
        cause: error,
      });
    }
  },

  /**
   * Revoke an invitation
   */
  revokeInvitation: async ({
    user,
    db,
    id,
  }: OrganizationServiceContext & {
    id: string;
  }): Promise<{ success: boolean }> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to revoke an invitation",
      });
    }

    try {
      // Find the invitation
      const invitation = await db.invitation.findUnique({
        where: { id },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Check if user has admin rights
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: invitation.organizationId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== OrganizationRole.ADMIN &&
          membership.role !== OrganizationRole.OWNER)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to revoke invitations for this organization",
        });
      }

      // Revoke the invitation
      await db.invitation.update({
        where: { id },
        data: { status: InvitationStatus.REVOKED },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to revoke invitation",
        cause: error,
      });
    }
  },

  /**
   * Remove a user from an organization
   */
  removeUser: async ({
    user,
    db,
    organizationId,
    userId,
  }: OrganizationServiceContext & {
    organizationId: string;
    userId: string;
  }): Promise<{ success: boolean }> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to remove users",
      });
    }

    try {
      // Check if organization exists
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Check if user has admin rights or is removing themselves
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });

      const isRemovingSelf = user.id === userId;

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this organization",
        });
      }

      if (
        !isRemovingSelf &&
        membership.role !== OrganizationRole.ADMIN &&
        membership.role !== OrganizationRole.OWNER
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to remove users from this organization",
        });
      }

      // Cannot remove the owner
      if (organization.ownerId === userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot remove the organization owner",
        });
      }

      // Remove the user
      await db.userOrganization.delete({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

      // If this was the user's default organization, set a new default if possible
      const targetUser = await db.user.findUnique({
        where: { id: userId },
      });

      if (targetUser && targetUser.defaultOrganizationId === organizationId) {
        const anotherOrg = await db.userOrganization.findFirst({
          where: { userId },
          select: { organizationId: true },
        });

        await db.user.update({
          where: { id: userId },
          data: {
            defaultOrganizationId: anotherOrg
              ? anotherOrg.organizationId
              : null,
          },
        });
      }

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to remove user",
        cause: error,
      });
    }
  },

  /**
   * Update a user's role in an organization
   */
  updateUserRole: async ({
    user,
    db,
    organizationId,
    userId,
    role,
  }: OrganizationServiceContext & {
    organizationId: string;
    userId: string;
    role: OrganizationRole;
  }): Promise<{ success: boolean }> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to update user roles",
      });
    }

    try {
      // Check if organization exists
      const organization = await db.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Check if user has admin rights
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });

      if (!membership || membership.role !== OrganizationRole.OWNER) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the organization owner can change user roles",
        });
      }

      // Cannot change the owner's role
      if (organization.ownerId === userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot change the organization owner's role",
        });
      }

      // Update the user's role
      await db.userOrganization.update({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
        data: { role },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user role",
        cause: error,
      });
    }
  },

  /**
   * Set a user's default organization
   */
  setDefaultOrganization: async ({
    user,
    db,
    organizationId,
  }: OrganizationServiceContext & {
    organizationId: string;
  }): Promise<{ success: boolean }> => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to set a default organization",
      });
    }

    try {
      // Check if user is a member of the organization
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this organization",
        });
      }

      // Update the user's default organization
      await db.user.update({
        where: { id: user.id },
        data: { defaultOrganizationId: organizationId },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to set default organization",
        cause: error,
      });
    }
  },

  /**
   * Get all members of an organization
   */
  getMembers: async ({
    user,
    db,
    organizationId,
  }: OrganizationServiceContext & {
    organizationId: string;
  }) => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view organization members",
      });
    }

    try {
      // Check if user is a member of the organization
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });

      if (!membership) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this organization",
        });
      }

      // Get all members
      const members = await db.userOrganization.findMany({
        where: { organizationId },
        include: { user: true },
      });

      return members.map((m) => ({
        id: m.userId,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
        joinedAt: m.createdAt,
      }));
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organization members",
        cause: error,
      });
    }
  },

  /**
   * Get all pending invitations for an organization
   */
  getPendingInvitations: async ({
    user,
    db,
    organizationId,
  }: OrganizationServiceContext & {
    organizationId: string;
  }) => {
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to view invitations",
      });
    }

    try {
      // Check if user has admin rights
      const membership = await db.userOrganization.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== OrganizationRole.ADMIN &&
          membership.role !== OrganizationRole.OWNER)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to view invitations for this organization",
        });
      }

      // Get all pending invitations
      return await db.invitation.findMany({
        where: {
          organizationId,
          status: InvitationStatus.PENDING,
        },
        include: {
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch invitations",
        cause: error,
      });
    }
  },

  /**
   * Get invitation details by token
   */
  getInvitationByToken: async ({
    db,
    token,
  }: {
    db: PrismaClient;
    token: string;
  }) => {
    try {
      // Find the invitation with organization and inviter details
      const invitation = await db.invitation.findUnique({
        where: {
          token,
          // Don't filter by status here to allow showing appropriate messages
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
          inviter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      // Check if invitation is already used or revoked
      if (invitation.status === InvitationStatus.ACCEPTED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has already been accepted",
        });
      }

      if (invitation.status === InvitationStatus.REVOKED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This invitation has been revoked by the organization admin",
        });
      }

      // Check if invitation is expired
      if (
        invitation.status === InvitationStatus.PENDING &&
        invitation.expiresAt < new Date()
      ) {
        // Update status to expired
        await db.invitation.update({
          where: { id: invitation.id },
          data: { status: InvitationStatus.EXPIRED },
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      if (invitation.status === InvitationStatus.EXPIRED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation has expired",
        });
      }

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
        organization: invitation.organization,
        inviter: invitation.inviter,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch invitation details",
        cause: error,
      });
    }
  },
};
