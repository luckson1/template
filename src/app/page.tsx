import Link from "next/link";
import { siteConfig } from "@/config/site";
import { HydrateClient } from "@/trpc/server";
import { auth } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart, Users, Zap } from "lucide-react";

export default async function Home() {
  const session = await auth();

  const features = [
    {
      icon: <BarChart className="size-6 text-primary" />,
      title: "Advanced Analytics",
      description:
        "Gain deep insights into your business performance with our comprehensive analytics suite.",
    },
    {
      icon: <Users className="size-6 text-primary" />,
      title: "Team Collaboration",
      description:
        "Work seamlessly with your team, assign tasks, and track progress in real-time.",
    },
    {
      icon: <Zap className="size-6 text-primary" />,
      title: "Workflow Automation",
      description:
        "Automate repetitive tasks and streamline your business processes for maximum efficiency.",
    },
  ];

  return (
    <HydrateClient>
      <main className="flex min-h-dvh flex-col bg-background text-foreground">
        <header className="container sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold sm:inline-block">
                {siteConfig.name}
              </span>
            </Link>
            <nav className="flex flex-1 items-center justify-end space-x-4">
              {session ? (
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </header>

        <section className="container flex flex-col items-center justify-center gap-6 pb-8 pt-6 text-center md:pb-12 md:pt-10 lg:py-32">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Supercharge Your Business with {siteConfig.name}
          </h1>
          <p className="max-w-[42rem] text-balance leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            {siteConfig.description}
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href={session ? "/dashboard" : "/register"}>
                Get Started Free <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </section>

        <section
          id="features"
          className="container space-y-6 bg-slate-50/50 py-8 dark:bg-transparent md:py-12 lg:py-24"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Explore the powerful features designed to help your business
              succeed.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-lg border bg-background p-2"
              >
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  {feature.icon}
                  <div className="space-y-2">
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by Your Company. The source code is available on GitHub.
            </p>
          </div>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: siteConfig.name,
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: siteConfig.application?.pricing?.value ?? "0",
                priceCurrency:
                  siteConfig.application?.pricing?.currency ?? "USD",
              },
              aggregateRating: siteConfig.application?.rating
                ? {
                    "@type": "AggregateRating",
                    ratingValue: siteConfig.application.rating.value,
                    ratingCount: siteConfig.application.rating.count,
                  }
                : undefined,
              description: siteConfig.description,
              screenshot: siteConfig.application?.screenshots?.map(
                (screenshot) => `${siteConfig.url}${screenshot.url}`,
              ),
              featureList: features.map((f) => f.title).join(", "),
              keywords: siteConfig.keywords.join(", "),
            }),
          }}
        />
      </main>
    </HydrateClient>
  );
}
