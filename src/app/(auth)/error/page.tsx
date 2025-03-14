"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, AlertTriangle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>(
    "An error occurred during authentication",
  );

  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.");
          break;
        case "AccessDenied":
          setErrorMessage("You do not have access to this resource.");
          break;
        case "Verification":
          setErrorMessage(
            "The verification link may have expired or already been used.",
          );
          break;
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
        case "OAuthAccountNotLinked":
          setErrorMessage(
            "There was a problem with the authentication provider.",
          );
          break;
        case "EmailSignin":
          setErrorMessage("The email could not be sent or is invalid.");
          break;
        case "CredentialsSignin":
          setErrorMessage("The credentials you provided are invalid.");
          break;
        case "SessionRequired":
          setErrorMessage("You must be signed in to access this page.");
          break;
        default:
          setErrorMessage(
            "An unexpected error occurred during authentication.",
          );
      }
    }
  }, [searchParams]);

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
              <div className="rounded-full bg-destructive/10 p-6">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">
              Authentication Error
            </CardTitle>
            <CardDescription className="text-center">
              {errorMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Please try again or contact support if the problem persists.</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
