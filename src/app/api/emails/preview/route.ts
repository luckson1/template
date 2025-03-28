import { InvitationEmail } from "../../../../emails/invitation-email";
import { OrganizationRole } from "@prisma/client";
import { render } from "@react-email/components";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const role =
      (searchParams.get("role") as OrganizationRole) ?? OrganizationRole.MEMBER;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const html = render(
      InvitationEmail({
        inviterName: "John Doe",
        inviterEmail: "john.doe@example.com",
        organizationName: "Acme Inc.",
        organizationLogo: "https://picsum.photos/200",
        invitationLink: "https://example.com/invitation/token",
        role: role,
        expiresAt: expiresAt,
        recipientEmail: "user@example.com",
      }),
    );

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error rendering email:", error);
    return NextResponse.json(
      { error: "Failed to render email template" },
      { status: 500 },
    );
  }
}
