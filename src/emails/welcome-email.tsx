import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// Basic styles - consider using Tailwind or more robust styling from react-email examples
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const paragraph = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
};

const link = {
  color: "#ff5a5f", // Example color, adjust to your brand
  textDecoration: "underline",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

interface WelcomeEmailProps {
  userName?: string | null;
  appName?: string; // Optional: Name of your application
  appUrl?: string; // Optional: URL to your application login/dashboard
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}`
  : "";

export const WelcomeEmail = ({
  // Changed export name to match filename convention
  userName,
  appName = "Our Platform", // Default app name
  appUrl = baseUrl || "#", // Default URL
}: WelcomeEmailProps) => {
  const previewText = `Welcome to ${appName}!`;
  const userFirstName = userName?.split(" ")[0] ?? "there"; // Try to get first name

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Optional: Add your logo */}
          {/* <Img src={`${baseUrl}/static/logo.png`} width="48" height="48" alt="Logo" /> */}

          <Heading style={heading}>Welcome aboard, {userFirstName}!</Heading>

          <Section style={{ paddingBottom: "20px" }}>
            <Text style={paragraph}>
              We&apos;re thrilled to have you join {appName}. We hope you find
              everything you need to get started.
            </Text>

            {appUrl && appUrl !== "#" && (
              <Text style={paragraph}>
                You can access your account and explore features here:
                <br />
                <Link style={link} href={appUrl}>
                  Go to Dashboard
                </Link>
              </Text>
            )}

            <Text style={paragraph}>
              If you have any questions or need help getting started, don&apos;t
              hesitate to reach out to our support team.
            </Text>

            <Text style={paragraph}>
              Best Regards,
              <br />
              The {appName} Team
            </Text>
          </Section>

          <Text style={footer}>
            You received this email because you signed up for {appName}.
            {/* Optional: Add unsubscribe link if applicable */}
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;
