import React from "react";
import {
  Html,
  Body,
  Head,
  Heading,
  Text,
  Container,
  Preview,
  Section,
  Button,
  Hr,
  Img,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import { type OrganizationRole } from "@prisma/client";

interface InvitationEmailProps {
  inviterName: string;
  inviterEmail: string | null;
  organizationName: string;
  organizationLogo?: string | null;
  invitationLink: string;
  role: OrganizationRole;
  expiresAt: Date;
  recipientEmail: string;
}

export const InvitationEmail = ({
  inviterName,
  inviterEmail,
  organizationName,
  organizationLogo,
  invitationLink,
  role,
  expiresAt,
  recipientEmail,
}: InvitationEmailProps) => {
  const formattedExpirationDate = new Date(expiresAt).toLocaleDateString(
    "en-US",
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  const roleDisplay = role.charAt(0) + role.slice(1).toLowerCase();

  return (
    <Html>
      <Head />
      <Preview>You&apos;ve been invited to join {organizationName}</Preview>
      <Tailwind>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded-lg border border-solid border-gray-200 bg-white p-4 shadow-md">
            <Section className="mt-8">
              {organizationLogo ? (
                <Img
                  src={organizationLogo}
                  alt={`${organizationName} logo`}
                  width="120"
                  height="auto"
                  className="mx-auto mb-4"
                />
              ) : (
                <Heading className="text-center text-xl text-gray-800">
                  {organizationName}
                </Heading>
              )}
            </Section>
            <Section className="mt-6">
              <Heading className="text-center text-2xl font-bold text-gray-800">
                You&apos;ve been invited to join {organizationName}
              </Heading>
              <Text className="mt-4 text-center text-gray-600">
                {inviterName} ({inviterEmail}) has invited you to join their
                organization on the platform as a <strong>{roleDisplay}</strong>
                .
              </Text>
            </Section>
            <Section className="my-8 text-center">
              <Button
                className="rounded-md bg-blue-600 px-6 py-3 text-center text-base font-medium text-white no-underline"
                href={invitationLink}
              >
                Accept Invitation
              </Button>
            </Section>
            <Hr className="my-6 border-gray-200" />
            <Section>
              <Text className="text-sm text-gray-600">
                This invitation was sent to {recipientEmail}. If you were not
                expecting this invitation, you can ignore this email.
              </Text>
              <Text className="text-sm text-gray-600">
                This invitation will expire on {formattedExpirationDate}.
              </Text>
            </Section>
            <Section className="mt-8 text-center">
              <Text className="text-xs text-gray-400">
                &copy; {new Date().getFullYear()} {organizationName}. All rights
                reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default InvitationEmail;
