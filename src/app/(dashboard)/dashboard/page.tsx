"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { api } from "@/trpc/react";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfileMutation = api.user.updateProfile.useMutation();

  useEffect(() => {
    if (status === "authenticated" && session?.user && !session.user.name) {
      setIsNameModalOpen(true);
    }
  }, [session, status]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setIsUpdating(true);

    try {
      await updateProfileMutation.mutateAsync(
        { name: nameInput.trim() },
        {
          onSuccess: (updatedUser) => {
            void update({ name: updatedUser.name });
            toast.success("Name updated successfully!");
            setIsNameModalOpen(false);
            setNameInput("");
          },
          onError: (error) => {
            toast.error(
              error.message || "Failed to update name. Please try again.",
            );
          },
          onSettled: () => {
            setIsUpdating(false);
          },
        },
      );
    } catch (error) {
      console.error("Unexpected error updating name:", error);
      toast.error("An unexpected error occurred.");
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome to your {siteConfig.name} dashboard. Here&apos;s an overview of
        your business.
      </p>

      {/* --- Name Update Dialog --- */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <form onSubmit={handleNameSubmit}>
            <DialogHeader>
              <DialogTitle>Welcome!</DialogTitle>
              <DialogDescription>
                Please enter your name to complete your profile setup.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="col-span-3"
                  required
                  disabled={isUpdating}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUpdating || !nameInput.trim()}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Name"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* --- End Name Update Dialog --- */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-emerald-500">
                +20.1% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
              <span>from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-emerald-500">
                +180.1% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
              <span>from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-emerald-500">
                +19% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>
              <span>from last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-0.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="flex items-center text-red-500">
                +0.1% <ArrowDownRight className="ml-1 h-3 w-3" />
              </span>
              <span>from last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Monthly revenue for the current year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[300px] items-center justify-center rounded-md border">
              <p className="text-muted-foreground">Revenue Chart Placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
            <CardDescription>New customers in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <span className="text-xs font-medium">C{i}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Company {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {i} days ago
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    ${Math.floor(Math.random() * 1000)}.00
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
