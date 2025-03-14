import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Mail, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">
          Get help and connect with our support team.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Submit a support ticket and we&apos;ll get back to you as soon as
              possible.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                <option value="account">Account Issues</option>
                <option value="billing">Billing & Payments</option>
                <option value="technical">Technical Problems</option>
                <option value="feature">Feature Requests</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <select
                id="priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low - General question or feedback</option>
                <option value="medium">Medium - Issue affecting my work</option>
                <option value="high">High - Serious problem</option>
                <option value="critical">Critical - System unusable</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you've tried so far."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="attachments" className="text-sm font-medium">
                Attachments (optional)
              </label>
              <Input id="attachments" type="file" multiple />
              <p className="text-xs text-muted-foreground">
                You can attach screenshots or relevant files (max 5MB each).
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Submit Ticket</Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Hours</CardTitle>
              <CardDescription>
                Our team is available during the following hours:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Monday - Friday</span>
                <span>9:00 AM - 8:00 PM ET</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Saturday</span>
                <span>10:00 AM - 6:00 PM ET</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Sunday</span>
                <span>Closed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                For critical issues outside of business hours, please use the
                emergency contact option.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alternative Contact Methods</CardTitle>
              <CardDescription>
                Other ways to reach our support team:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">
                    support@b2bsaas.com
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Response time: Within 24 hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">
                    +1 (800) 123-4567
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Available for Business and Enterprise plans
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">
                    Available in the bottom right corner of your dashboard
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Business hours only
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">API Integration Issue</p>
                    <p className="text-sm text-muted-foreground">
                      Opened 2 days ago
                    </p>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Billing Question</p>
                    <p className="text-sm text-muted-foreground">
                      Opened 5 days ago
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700"
                  >
                    Resolved
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                View All Tickets
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
