import { TRPCError } from "@trpc/server";
import { generateSlug } from "../utils/organization";
import type {
  PrismaClient,
  Organization,
  UserOrganization,
} from "@prisma/client";
import type {
  ICreateOrganization,
  IAddUserToOrganization,
} from "../schemas/organization.schema";
import { type User } from "next-auth";

// Define a type for Prisma errors
interface PrismaError extends Error {
  code: string;
  meta?: {
    target?: string[];
  };
}

export const organizationService = {
  /**
   * Get organizations for a user
   */
  getUserOrganizations: async ({
    user,
    db,
    input,
  }: {
    user: User | null;
    db: PrismaClient;
    input: { userId?: string };
  }) => {
    try {
      const userId = input.userId ?? user?.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      // Get all organizations where the user is a member
      const userOrganizations = await db.userOrganization.findMany({
        where: { userId },
        include: {
          organization: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Transform the data to match the TeamSwitcher component format
      return userOrganizations.map(
        (userOrg: UserOrganization & { organization: Organization }) => ({
          id: userOrg.organization.id,
          name: userOrg.organization.name,
          logo: userOrg.organization.logo,
          role: userOrg.role,
          // Determine plan based on subscription status
          plan:
            userOrg.organization.subscriptionStatus === "active"
              ? "Pro Plan"
              : userOrg.organization.subscriptionStatus === "trialing"
                ? "Trial"
                : "Free Plan",
        }),
      );
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user organizations",
        cause: error,
      });
    }
  },

  /**
   * Create a new organization
   */
  create: async ({
    user,
    db,
    input,
  }: {
    user: User | null;
    db: PrismaClient;
    input: ICreateOrganization;
  }) => {
    try {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create an organization",
        });
      }

      // Generate slug if not provided
      const slug = input.slug ?? generateSlug(input.name);

      // Create the organization
      const organization = await db.organization.create({
        data: {
          name: input.name,
          slug,
          logo: input.logo,
          website: input.website,
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

      // If this is the user's first organization, set it as default
      const userRecord = await db.user.findUnique({
        where: { id: user.id },
        select: { defaultOrganizationId: true },
      });

      if (!userRecord?.defaultOrganizationId) {
        await db.user.update({
          where: { id: user.id },
          data: { defaultOrganizationId: organization.id },
        });
      }

      return organization;
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      // Type guard for Prisma errors
      const prismaError = error as PrismaError;
      if (
        prismaError.code === "P2002" &&
        prismaError.meta?.target?.includes("slug")
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An organization with this slug already exists",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create organization",
      });
    }
  },

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
  }) => {
    try {
      // Generate a default organization name
      const orgName = name ? `${name}'s Organization` : "My Organization";
      const slug = generateSlug(orgName);

      // Create the organization
      const organization = await db.organization.create({
        data: {
          name: orgName,
          slug,
          ownerId: userId,
          // Create the user-organization relationship with OWNER role
          members: {
            create: {
              userId,
              role: "OWNER",
            },
          },
        },
      });

      // Set as default organization for the user
      await db.user.update({
        where: { id: userId },
        data: { defaultOrganizationId: organization.id },
      });

      return organization;
    } catch (error) {
      console.error("Error creating default organization:", error);
      throw error;
    }
  },

  /**
   * Get an organization by ID
   */
  getById: async ({
    user,
    db,
    input,
  }: {
    user: User | null;
    db: PrismaClient;
    input: { id: string };
  }) => {
    try {
      const organization = await db.organization.findUnique({
        where: { id: input.id },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          teams: true,
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Check if the user is a member of this organization
      if (user?.id) {
        const isMember = organization.members.some(
          (member) => member.userId === user.id,
        );

        if (!isMember) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this organization",
          });
        }
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
   * Add a user to an organization
   */
  addUserToOrganization: async ({
    user,
    db,
    input,
  }: {
    user: User | null;
    db: PrismaClient;
    input: IAddUserToOrganization;
  }) => {
    try {
      if (!user?.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to add a user to an organization",
        });
      }

      // Get the organization
      const organization = await db.organization.findUnique({
        where: { id: input.organizationId },
        include: {
          members: true,
        },
      });

      if (!organization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organization not found",
        });
      }

      // Check if the current user has permission to add members
      const currentUserMembership = organization.members.find(
        (member) => member.userId === user.id,
      );

      if (
        !currentUserMembership ||
        (currentUserMembership.role !== "OWNER" &&
          currentUserMembership.role !== "ADMIN")
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to add members to this organization",
        });
      }

      // Determine which user to add
      const userIdToAdd = input.userId ?? user.id;

      // Check if the user is already a member
      const isAlreadyMember = organization.members.some(
        (member) => member.userId === userIdToAdd,
      );

      if (isAlreadyMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this organization",
        });
      }

      // Add the user to the organization
      const userOrganization = await db.userOrganization.create({
        data: {
          userId: userIdToAdd,
          organizationId: input.organizationId,
          role: input.role,
        },
        include: {
          organization: true,
          user: true,
        },
      });

      return userOrganization;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add user to organization",
        cause: error,
      });
    }
  },
};
