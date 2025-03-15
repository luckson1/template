import { TRPCError } from "@trpc/server";
import { type inferAsyncReturnType } from "@trpc/server";
import { type createTRPCContext } from "../trpc";
import { generateSlug } from "../utils/organization";
import { db } from "@/server/db";
import type { ICreateOrganization } from "../schemas/organization.schema";

// Define the Context type based on the return type of createTRPCContext
type Context = inferAsyncReturnType<typeof createTRPCContext>;

// Define a type for Prisma errors
interface PrismaError extends Error {
  code: string;
  meta?: {
    target?: string[];
  };
}

export const organizationService = {
  /**
   * Create a new organization
   */
  create: async ({
    ctx,
    input,
  }: {
    ctx: Context;
    input: ICreateOrganization;
  }) => {
    try {
      const userId = ctx.session?.user.id;

      if (!userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create an organization",
        });
      }

      // Generate slug if not provided
      const slug = input.slug ?? generateSlug(input.name);

      // Create the organization
      const organization = await ctx.db.organization.create({
        data: {
          name: input.name,
          slug,
          logo: input.logo,
          website: input.website,
          ownerId: userId,
          // Create the user-organization relationship with OWNER role
          members: {
            create: {
              userId,
              role: "OWNER",
            },
          },
        },
        include: {
          members: true,
        },
      });

      // If this is the user's first organization, set it as default
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
        select: { defaultOrganizationId: true },
      });

      if (!user?.defaultOrganizationId) {
        await ctx.db.user.update({
          where: { id: userId },
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
  }: {
    userId: string;
    name?: string | null;
  }) => {
    try {
      // Generate organization name from user's name or email
      const orgName = name ?? "Default Organization";

      // Generate a slug from the organization name
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

      // Update the user's defaultOrganizationId
      await db.user.update({
        where: { id: userId },
        data: { defaultOrganizationId: organization.id },
      });

      return organization;
    } catch (error) {
      console.error("Failed to create default organization:", error);
      throw error;
    }
  },
};
