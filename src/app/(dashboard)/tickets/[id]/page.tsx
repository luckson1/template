import { auth } from "@/server/auth";
import { TicketDetailClient } from "./components/TicketDetailClient";
import { redirect } from "next/navigation";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  return <TicketDetailClient id={params.id} session={session} />;
}
