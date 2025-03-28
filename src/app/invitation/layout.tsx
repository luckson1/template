// layout with next auth session provider

import { auth } from "@/server/auth";
import { SessionProvider } from "next-auth/react";

export default async function InvitationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
