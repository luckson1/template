import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Manage and track all your support requests in one place",
};

export default function TicketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
