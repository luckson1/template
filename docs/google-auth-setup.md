# Setting Up Google Authentication for Local Development

This guide will walk you through setting up Google Authentication for your local development environment using NextAuth.js.

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Select "Web application" as the application type
6. Give your OAuth client a name (e.g., "My App Dev")

## 2. Configure Authorized Redirect URIs

For local development with NextAuth.js, add the following redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

This is the default callback URL that NextAuth.js uses for Google authentication. If you're using a different port, replace `3000` with your port number.

## 3. Get Your Client ID and Secret

After creating the OAuth client, Google will provide you with a Client ID and Client Secret. You'll need these for your environment variables.

## 4. Set Up Environment Variables

Create a `.env.local` file in the root of your project (if it doesn't exist already) and add the following variables:

```
# Google OAuth
AUTH_GOOGLE_ID=your_client_id_here
AUTH_GOOGLE_SECRET=your_client_secret_here

# NextAuth
AUTH_SECRET=your_random_secret_here
```

For the `AUTH_SECRET`, you can generate a random string using:

```bash
openssl rand -base64 32
```

## 5. Testing Authentication

1. Start your development server:

```bash
pnpm dev
```

2. Navigate to your login page (e.g., http://localhost:3000/login)
3. Click on the Google sign-in button
4. You should be redirected to Google's authentication page
5. After authenticating, you should be redirected back to your application

## Troubleshooting

### Redirect URI Mismatch

If you see an error like "Error 400: redirect_uri_mismatch", it means the redirect URI in your Google OAuth settings doesn't match the one NextAuth is using. Make sure you've added the correct redirect URI:

```
http://localhost:3000/api/auth/callback/google
```

### Invalid Client ID or Secret

If you see authentication errors, double-check that your Client ID and Client Secret are correctly set in your `.env.local` file.

### CSRF State Validation Failed

This can happen if your cookies aren't being properly set. Make sure your application is running on `http://localhost` and not `http://127.0.0.1`, as some browsers treat these differently for cookie purposes.

## Production Configuration

For production, you'll need to:

1. Add your production domain to the Authorized JavaScript origins in Google Cloud Console
2. Add your production callback URL to the Authorized redirect URIs:

```
https://yourdomain.com/api/auth/callback/google
```

3. Update your environment variables on your hosting platform with the production values
