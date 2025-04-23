import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/resend";
import type { SystemRole } from "@prisma/client";
import { Client as WorkflowClient } from "@upstash/workflow";

import { env } from "@/env";
import { db } from "@/server/db";

// --- Workflow Client Initialization ---
// Ensure QSTASH_TOKEN and optional QSTASH_URL / UPSTASH_WORKFLOW_URL / NEXT_PUBLIC_APP_URL are in env
const workflowClient = new WorkflowClient({
  token: env.QSTASH_TOKEN,
  baseUrl: env.QSTASH_URL, // Optional: Only needed for local QStash server
});

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      systemRole: SystemRole;
      defaultOrganizationId: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    systemRole: SystemRole;
    defaultOrganizationId?: string | null;
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    }),
    EmailProvider({
      apiKey: env.RESEND_API_KEY,
      from: env.EMAIL_FROM_ADDRESS,
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/error",
    verifyRequest: "/verify-request",
  },
  // @ts-expect-error types
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,

      user: {
        ...session.user,
        id: user.id,
        systemRole: user.systemRole,
        defaultOrganizationId: user?.defaultOrganizationId ?? null,
      },
    }),
  },
  events: {
    createUser: async ({ user }) => {
      // 1. Trigger the welcome email workflow
      if (!user.email) {
        console.warn(
          `Cannot trigger welcome email for user ${user.id}: Email is missing.`,
        );
        return; // Stop if no email
      }

      try {
        const workflowRunId = `welcome-email-${user.id}-${Date.now()}`;
        console.log(
          `Triggering welcome email workflow ${workflowRunId} for user ${user.id}`,
        );

        // Construct the full URL for the workflow endpoint
        const appBaseUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        const workflowEndpointUrl = `${appBaseUrl}/api/workflow/send-welcome-email`;

        await workflowClient.trigger({
          url: workflowEndpointUrl,
          body: {
            userId: user.id,
            email: user.email, // Safe to use now after the check above
            name: user.name ?? undefined, // Pass name if available
          },
          workflowRunId: workflowRunId,
          retries: 2, // Retry trigger once if initial request fails
        });
        console.log(
          `Welcome email workflow triggered successfully for user ${user.id}`,
        );
      } catch (workflowError) {
        console.error(
          `Failed to trigger welcome email workflow for user ${user.id}:`,
          workflowError,
        );
      }

      // 2. Trigger Default Organization Creation Workflow
      if (user.id && user.name) {
        try {
          const orgWorkflowRunId = `create-org-${user.id}-${Date.now()}`;
          console.log(
            `Triggering default org creation workflow ${orgWorkflowRunId} for user ${user.id}`,
          );

          const appBaseUrl = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
          const orgWorkflowEndpointUrl = `${appBaseUrl}/api/workflow/create-default-organization`;

          await workflowClient.trigger({
            url: orgWorkflowEndpointUrl,
            body: {
              userId: user.id,
              name: user.name, // Name is checked above
            },
            workflowRunId: orgWorkflowRunId,
            retries: 1, // Retry trigger once if initial request fails
          });
          console.log(
            `Default org creation workflow triggered successfully for user ${user.id}`,
          );
        } catch (orgWorkflowError) {
          console.error(
            `Failed to trigger default org creation workflow for user ${user.id}:`,
            orgWorkflowError,
          );
          // Log the error, but don't block sign-up
        }
      } else {
        console.warn(
          `Skipping default org creation workflow trigger for user ${user.id}: Missing ID or name.`,
        );
      }
    },
  },
} satisfies NextAuthConfig;
