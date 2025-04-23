import { serve } from "@upstash/workflow/nextjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { db } from "@/server/db"; // Import the db instance
import { organizationService } from "@/server/api/services/organization"; // Import the service
import { env } from "@/env"; // If needed for things like app URL

// --- Define Input Schema ---
const createDefaultOrgInputSchema = z.object({
  userId: z.string().describe("The ID of the newly signed up user."),
  name: z.string().describe("The name of the user, used for the org name."),
});

// Type for the input payload
type CreateDefaultOrgPayload = z.infer<typeof createDefaultOrgInputSchema>;

// --- Workflow Definition ---
export const { POST } = serve<CreateDefaultOrgPayload>(
  async (context) => {
    const { userId, name } = context.requestPayload;

    console.log(
      `Workflow started: Create Default Organization for user ${userId} (name: ${name})`,
    );

    // === Step 1: Create Default Organization ===
    await context.run("create-default-org", async () => {
      try {
        console.log(
          `Attempting to create default organization for user ${userId}`,
        );

        const organization = await organizationService.createDefaultForUser({
          userId,
          name,
          db, // Pass the db instance
        });

        console.log(
          `Default organization created successfully for user ${userId}. Org ID: ${organization.id}`,
        );
        return { success: true, organizationId: organization.id };
      } catch (error) {
        console.error(
          `Error in create-default-org step for user ${userId}:`,
          error,
        );
        // Ensure the error is propagated correctly for workflow retries/failure handling
        if (error instanceof TRPCError) {
          throw error; // Re-throw TRPC errors directly
        }
        // Wrap other errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `An unexpected error occurred while creating the default organization.`,
          cause: error instanceof Error ? error : undefined,
        });
      }
    });

    console.log(
      `Workflow completed successfully for user ${userId} (Default Org Creation)`,
    );
    return { success: true, userId };
  },
  {
    // --- Workflow Options ---
    retries: 3, // Retry org creation a few times on transient errors
    failureFunction: async ({ failStatus, failResponse, context }) => {
      const inputPayload = context.requestPayload as
        | CreateDefaultOrgPayload
        | undefined;
      const userDesc = inputPayload
        ? `${inputPayload.userId} (name: ${inputPayload.name})`
        : "unknown user";
      console.error(
        `Workflow Run ${context.workflowRunId} failed for Create Default Organization for ${userDesc}. Status: ${failStatus}, Response: ${JSON.stringify(failResponse)}`,
      );
    },
  },
);
