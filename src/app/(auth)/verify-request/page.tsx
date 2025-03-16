import Link from "next/link";
import { Mail, ArrowLeft, GalleryVerticalEnd } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";
export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {siteConfig.name}
        </a>

        <Card className="w-full">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Mail className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl font-semibold">
                Check your email
              </CardTitle>
              <CardDescription>
                We&apos;ve sent a verification link to your email address.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              Click the link in the email to verify your account and continue.
            </p>
            <p className="mt-2">
              If you don&apos;t see the email, check your spam folder.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-6 pb-6">
            <Button asChild variant="outline" className="w-full">
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
