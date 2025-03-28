import { Resend } from "resend";
import { InvitationEmail } from "../../emails/invitation-email";
import { type OrganizationRole } from "@prisma/client";
import { render } from "@react-email/components";

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Email service for sending different types of emails
export const emailService = {
  /**
   * Send an organization invitation email
   */
  sendInvitation: async ({
    inviterName,
    inviterEmail,
    organizationName,
    organizationLogo,
    invitationToken,
    role,
    expiresAt,
    recipientEmail,
  }: {
    inviterName: string;
    inviterEmail: string | null;
    organizationName: string;
    organizationLogo?: string | null | undefined;
    invitationToken: string;
    role: OrganizationRole;
    expiresAt: Date;
    recipientEmail: string;
  }) => {
    try {
      // Generate the invitation link with the token
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const invitationLink = `${baseUrl}/invitation/${invitationToken}`;

      // Create the email react component with props
      const emailHtml = await render(
        InvitationEmail({
          inviterName,
          inviterEmail,
          organizationName,
          organizationLogo,
          invitationLink,
          role,
          expiresAt,
          recipientEmail,
        }),
      );

      // Send the email using Resend
      const { data, error } = await resend.emails.send({
        from: `${organizationName} <${process.env.EMAIL_FROM_ADDRESS ?? "noreply@example.com"}>`,
        to: recipientEmail,
        subject: `You're invited to join ${organizationName}`,
        html: emailHtml,
      });

      if (error) {
        console.error("Failed to send invitation email:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error("Error sending invitation email:", error);
      return { success: false, error };
    }
  },
};
