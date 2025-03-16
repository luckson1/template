import { TRPCError } from "@trpc/server";
import type { PrismaClient } from "@prisma/client";
import type { User } from "next-auth";

interface IUserServiceContext {
  user: User | null;
  db: PrismaClient;
  input: Partial<User>;
}

export const userService = {
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
      const foundUser = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!foundUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return foundUser;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user",
      });
    }
  },

  create: async ({ user, db, input }: IUserServiceContext) => {
    try {
      // Check if the user is authenticated if needed
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a user",
        });
      }

      return await db.user.create({
        data: input,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;

      // Type guard for Prisma errors
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2002") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already exists",
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create user",
      });
    }
  },

  update: async ({
    user,
    db,
    input,
  }: {
    user: User | null;
    db: PrismaClient;
    input: { id: string; data: Partial<User> };
  }) => {
    try {
      // Check if the user is authenticated
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a user",
        });
      }

      // Check if the user is updating their own profile or has admin permissions
      if (input.id !== user.id) {
        // Here you could add additional permission checks
        // For example, check if the user is an admin
      }

      return await db.user.update({
        where: { id: input.id },
        data: input.data,
      });
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update user",
      });
    }
  },
};
