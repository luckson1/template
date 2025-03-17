"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InvitationRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Redirect to the new URL format
      router.replace(`/invitation/${token}`);
    } else {
      // If no token is provided, redirect to the home page
      router.replace("/");
    }
  }, [token, router]);

  // Return a loading state or empty div while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
      Redirecting...
    </div>
  );
}
