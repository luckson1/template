"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Building2, LogOut, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            <h1 className="text-2xl font-bold">B2B SaaS</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <LogOut className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Sign Out</CardTitle>
            <CardDescription className="text-center">
              Are you sure you want to sign out?
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>You will need to sign in again to access your account.</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={handleLogout}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing out..." : "Yes, sign me out"}
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
