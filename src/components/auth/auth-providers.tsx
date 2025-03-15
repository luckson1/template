"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function AuthProviders() {
  const enabledProviders = siteConfig.auth.providers.filter(
    (provider) => provider.enabled,
  );

  return (
    <div className="flex flex-col gap-4">
      {enabledProviders.map((provider) => (
        <Button
          key={provider.name}
          variant={provider.name === "email" ? "outline" : "default"}
          className="flex items-center gap-2"
          onClick={() => signIn(provider.name, { callbackUrl: "/" })}
        >
          {provider.icon && (
            <Image
              src={provider.icon}
              alt={`${provider.displayName} logo`}
              width={20}
              height={20}
            />
          )}
          Sign in with {provider.displayName}
        </Button>
      ))}
    </div>
  );
}

export function EmailAuthForm() {
  const emailProvider = siteConfig.auth.providers.find(
    (provider) => provider.name === "email" && provider.enabled,
  );

  if (!emailProvider) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Sign in with Email</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const email = e.currentTarget.email.value;
          signIn("email", { email, callbackUrl: "/" });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="rounded-md border border-gray-300 px-4 py-2"
          required
        />
        <Button type="submit">Send magic link</Button>
      </form>
    </div>
  );
}
