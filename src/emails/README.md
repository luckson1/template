# Email Service Documentation

This directory contains the email templates and services for sending emails using Resend and React Email.

## Setup

1. Sign up for a [Resend](https://resend.com) account
2. Create an API key in the Resend dashboard
3. Add the API key to your `.env` file:

```bash
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM_ADDRESS=hello@yourdomain.com
```

## Templates

### Invitation Email

The invitation email is used to invite users to join an organization. It includes:

- Organization logo (if available)
- Invitation message with the inviter's name and email
- Role the user is being invited to
- Accept invitation button
- Expiration date

## Preview Emails

You can preview the invitation email by visiting:

```
/api/emails/preview
```

This will render the invitation email with sample data.

## API

### Email Service

The email service is located in `src/server/services/email.ts`. It provides methods for sending different types of emails.

#### `sendInvitation`

Sends an invitation email to a user.

```typescript
await emailService.sendInvitation({
  inviterName: "John Doe",
  inviterEmail: "john@example.com",
  organizationName: "Acme Inc.",
  organizationLogo: "https://example.com/logo.png", // Optional
  invitationToken: "invitation-token",
  role: OrganizationRole.MEMBER,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  recipientEmail: "user@example.com",
});
```

## Adding New Email Templates

1. Create a new React component in the `src/emails` directory
2. Add a new method to the email service in `src/server/services/email.ts`
3. Add a preview route in `src/app/api/emails/preview` for testing
