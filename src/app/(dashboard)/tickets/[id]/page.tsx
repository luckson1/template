import { auth } from "@/server/auth";
import { TicketDetailClient } from "./components/TicketDetailClient";
import { redirect } from "next/navigation";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  const { id } = await params;
  return <TicketDetailClient id={id} session={session} />;
}
