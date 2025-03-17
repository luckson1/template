import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { CreateOrganizationForm } from "../_components/create-organization-form";

export const metadata = {
  title: "Create Organization",
  description: "Create a new organization",
};

export default async function CreateOrganizationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-2xl">
        <CreateOrganizationForm />
      </div>
    </div>
  );
}
