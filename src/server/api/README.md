# API Service Pattern

## Overview

This document outlines the service pattern used in our tRPC API implementation. We use a layered architecture:

1. **Router Layer**: Handles HTTP requests, input validation, and authorization
2. **Service Layer**: Contains business logic and domain operations
3. **Data Access Layer**: Interacts with the database (via Prisma)

## Service Pattern

Our services follow a pattern where we pass the authenticated user and database client directly to service functions instead of passing the entire context. This provides several benefits:

- **Explicit dependencies**: Services clearly declare what they need
- **Better testability**: Easier to mock specific dependencies
- **Reduced coupling**: Services don't depend on the entire context structure

### Example Service

```typescript
// src/server/api/services/user.ts
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

  // Other service methods...
};
```

### Using Services in Routers

In your router files, extract the user and pass the database client directly:

```typescript
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { userSchema, getUserByIdSchema } from "../schemas/user";
import { userService } from "../services/user";
import { db } from "@/server/db";

export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(getUserByIdSchema)
    .query(({ ctx, input }) => {
      return userService.getById({
        user: ctx.session.user,
        db,
        input,
      });
    }),

  // Other router procedures...
});
```

## Benefits

1. **Clearer dependencies**: Services explicitly declare what they need
2. **Improved testability**: Easier to mock specific dependencies for testing
3. **Better separation of concerns**: Business logic is isolated from request handling
4. **Type safety**: More precise typing for service parameters
5. **Reduced coupling**: Services don't depend on the entire context structure

## Error Handling

Services should handle errors appropriately:

1. Use `TRPCError` for expected errors (not found, unauthorized, etc.)
2. Catch and wrap unexpected errors with appropriate error codes
3. Include helpful error messages for debugging

## Authentication and Authorization

Authentication is handled at the router level with procedures:

- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires authenticated user

Authorization (permissions) should be handled in the service layer:

- Check if the user has permission to perform the action
- Throw appropriate `TRPCError` if not authorized
