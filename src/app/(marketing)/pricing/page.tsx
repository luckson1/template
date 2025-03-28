import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="w-full bg-muted/50 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Choose the plan that&apos;s right for your business. All plans
                include a 14-day free trial.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>Billed Monthly</span>
              <div className="inline-flex h-6 items-center rounded-full border bg-muted p-1">
                <div className="h-4 w-4 rounded-full bg-primary"></div>
              </div>
              <span className="font-medium">Billed Annually</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Starter Plan */}
            <Card className="flex flex-col">
              <CardHeader className="flex flex-col space-y-1.5 pb-6">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <CardDescription>
                  Perfect for small businesses and startups.
                </CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$49</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  billed annually ($59 monthly)
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Up to 5 team members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>10GB storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Basic analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Email support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>API access</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Business Plan */}
            <Card className="flex flex-col border-primary">
              <CardHeader className="flex flex-col space-y-1.5 pb-6">
                <div className="mx-auto mb-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Most Popular
                </div>
                <CardTitle className="text-2xl">Business</CardTitle>
                <CardDescription>
                  Ideal for growing businesses and teams.
                </CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">$99</span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  billed annually ($119 monthly)
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Up to 20 team members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>50GB storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Priority email support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>API access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Custom integrations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Team collaboration tools</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="flex flex-col">
              <CardHeader className="flex flex-col space-y-1.5 pb-6">
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>
                  For large organizations with advanced needs.
                </CardDescription>
                <div className="mt-4 flex items-baseline text-primary">
                  <span className="text-4xl font-bold tracking-tight">
                    $249
                  </span>
                  <span className="ml-1 text-xl font-semibold">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  billed annually ($299 monthly)
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Unlimited team members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>500GB storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Enterprise analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>24/7 phone & email support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Dedicated account manager</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Custom API development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Advanced security features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Single sign-on (SSO)</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full bg-muted/50 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Have questions? We&apos;ve got answers.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-6 md:grid-cols-2">
            {[
              {
                question: "How does the 14-day free trial work?",
                answer:
                  "You can sign up for any plan and try all features for 14 days. No credit card required. At the end of the trial, you can choose to subscribe or your account will be downgraded to a limited free version.",
              },
              {
                question: "Can I change plans later?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, you'll receive credit towards future bills.",
              },
              {
                question: "Is there a setup fee?",
                answer:
                  "No, there are no setup fees for any of our plans. You only pay the monthly or annual subscription fee.",
              },
              {
                question:
                  "Do you offer discounts for non-profits or educational institutions?",
                answer:
                  "Yes, we offer special pricing for qualified non-profit organizations and educational institutions. Please contact our sales team for more information.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and bank transfers for annual plans. For enterprise customers, we can also arrange custom payment terms.",
              },
              {
                question: "How secure is my data?",
                answer:
                  "We take security seriously. All data is encrypted in transit and at rest. We use industry-standard security practices and regularly undergo security audits.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Still Have Questions?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Our team is here to help you find the perfect plan for your
                business.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg">Contact Sales</Button>
              <Button size="lg" variant="outline">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
