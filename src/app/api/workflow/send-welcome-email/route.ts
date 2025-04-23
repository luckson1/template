import { serve } from "@upstash/workflow/nextjs";
import { z } from "zod";
import { Resend } from "resend"; // Assuming Resend is used
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import WelcomeEmail from "@/emails/welcome-email"; // <-- Import the component

// --- Resend Client ---
const resend = new Resend(env.RESEND_API_KEY);
const fromEmail = env.EMAIL_FROM_ADDRESS;

// --- Define Input Schema ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const welcomeEmailInputSchema = z.object({
  userId: z.string().describe("The ID of the newly signed up user."),
  email: z.string().email().describe("The email address of the user."),
  name: z.string().optional().describe("The name of the user, if available."),
});

// Type for the input payload
type WelcomeEmailPayload = z.infer<typeof welcomeEmailInputSchema>;

// --- Workflow Definition ---
export const { POST } = serve<WelcomeEmailPayload>(
  async (context) => {
    const { userId, email, name } = context.requestPayload;

    console.log(
      `Workflow started: Send Welcome Email for user ${userId} (${email})`,
    );

    // === Step 1: Send Welcome Email ===
    await context.run("send-email", async () => {
      try {
        const subject = "Welcome to Our Platform!"; // Customize subject

        console.log(
          `Attempting to send welcome email to ${email} from ${fromEmail}`,
        );

        // Using Resend's send method
        // Replace the 'react' field with your actual email template/content
        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: subject,

          react: WelcomeEmail({
            userName: name, // Pass name (could be null/undefined)
            // You can pass other props like appName or appUrl if needed
            appName: "Advert Farm", // Replace with actual app name or get from env
            appUrl: env.NEXT_PUBLIC_APP_URL, // Make sure this env var is set
          }),
        });

        if (error) {
          console.error(`Resend failed for ${email}:`, error);
          // Throw a specific error to indicate email sending failure
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to send welcome email: ${error.message}`,
            cause: error,
          });
        }

        console.log(
          `Welcome email sent successfully to ${email}. Message ID: ${data?.id}`,
        );
        return { success: true, messageId: data?.id };
      } catch (error) {
        console.error(`Error in send-email step for ${email}:`, error);
        // Ensure the error is propagated correctly for workflow retries/failure handling
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `An unexpected error occurred while sending the welcome email.`,
          cause: error instanceof Error ? error : undefined,
        });
      }
    });

    console.log(
      `Workflow completed successfully for user ${userId} (${email})`,
    );
    return { success: true, userId, email };
  },
  {
    // --- Workflow Options ---
    retries: 4, // Retry sending the email a couple of times on transient errors
    failureFunction: async ({ failStatus, failResponse, context }) => {
      const inputPayload = context.requestPayload as
        | WelcomeEmailPayload
        | undefined;
      const userDesc = inputPayload
        ? `${inputPayload.userId} (${inputPayload.email})`
        : "unknown user";
      console.error(
        `Workflow Run ${context.workflowRunId} failed for Welcome Email to ${userDesc}. Status: ${failStatus}, Response: ${JSON.stringify(failResponse)}`,
      );
    },
  },
);
