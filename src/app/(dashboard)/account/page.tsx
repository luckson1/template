"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { updateUserProfileSchema } from "@/server/api/schemas/user.schema";
import { updateOrganizationSchema } from "@/server/api/schemas/organization.schema";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";

type UserFormValues = z.infer<typeof updateUserProfileSchema>;
type OrgFormValues = z.infer<typeof updateOrganizationSchema>;

export default function AccountPage() {
  // Fetch current user data
  const { data: userData, isLoading: isUserLoading } =
    api.user.getCurrentUser.useQuery();

  // Use the organization hook
  const {
    selectedOrgId,
    organizations,
    selectedOrg,
    setSelectedOrg,
    isLoading: isOrgsLoading,
  } = useOrganization();

  // User profile form
  const userForm = useForm<UserFormValues>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      id: "",
      name: "",
      image: "",
    },
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (userData) {
      userForm.reset({
        id: userData.id ?? "",
        name: userData.name ?? "",
        image: userData.image ?? "",
      });
    }
  }, [userData, userForm]);

  // Organization form
  const orgForm = useForm<OrgFormValues>({
    resolver: zodResolver(updateOrganizationSchema),
    defaultValues: {
      id: "",
      name: "",
      website: "",
      logo: "",
      billingEmail: "",
      billingName: "",
    },
  });

  // Update form values when selected org changes
  useEffect(() => {
    if (selectedOrg) {
      // Use type assertion to handle the organization structure
      const org = selectedOrg as unknown as {
        id: string;
        name: string;
        logo: string | null;
        website?: string;
        billingEmail?: string;
        billingName?: string;
      };

      orgForm.reset({
        id: org.id,
        name: org.name,
        website: org.website ?? "",
        logo: org.logo ?? "",
        billingEmail: org.billingEmail ?? "",
        billingName: org.billingName ?? "",
      });
    }
  }, [selectedOrg, orgForm]);

  // Update user profile mutation
  const updateUserMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(`Error updating profile: ${error.message}`);
    },
  });

  // Update organization mutation
  const updateOrgMutation = api.organization.update.useMutation({
    onSuccess: () => {
      toast.success("Organization updated successfully");
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Error updating organization: ${errorMessage}`);
    },
  });
  const utils = api.useUtils();
  // Set default organization mutation
  const setDefaultOrgMutation = api.user.setDefaultOrganization.useMutation({
    onSuccess: () => {
      toast.success("Default organization updated");
      void utils.organization.getUserOrganizations.invalidate();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Error setting default organization: ${errorMessage}`);
    },
  });

  // Handle setting default organization
  const handleSetDefaultOrg = () => {
    if (selectedOrgId) {
      setDefaultOrgMutation.mutate({ organizationId: selectedOrgId });
    }
  };

  // Handle user profile form submission
  const onUserSubmit = (data: UserFormValues) => {
    updateUserMutation.mutate(data);
  };

  // Handle organization form submission
  const onOrgSubmit = (data: OrgFormValues) => {
    if (data.id) {
      updateOrgMutation.mutate(data);
    }
  };

  if (isUserLoading || isOrgsLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* User Profile Settings */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your account profile information.
            </CardDescription>
          </CardHeader>
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={userForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {userData?.email}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email cannot be changed directly. Please contact support if
                    you need to update your email.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  type="submit"
                  disabled={
                    updateUserMutation.isPending || !userForm.formState.isDirty
                  }
                >
                  {updateUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Organization Settings */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>
              Update your organization details and business information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizations.length > 0 ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Select Organization
                  </label>
                  <Select
                    value={selectedOrgId ?? ""}
                    onValueChange={setSelectedOrg}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                          {org.id === userData?.defaultOrganizationId &&
                            " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedOrgId &&
                  selectedOrgId !== userData?.defaultOrganizationId && (
                    <div>
                      <Button
                        variant="outline"
                        onClick={handleSetDefaultOrg}
                        disabled={setDefaultOrgMutation.isPending}
                      >
                        {setDefaultOrgMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Set as Default Organization
                      </Button>
                    </div>
                  )}

                <Separator />

                {selectedOrgId && selectedOrg && (
                  <Form {...orgForm}>
                    <form onSubmit={orgForm.handleSubmit(onOrgSubmit)}>
                      <div className="space-y-4">
                        <FormField
                          control={orgForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Website</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name="logo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Logo URL</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name="billingEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Email</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name="billingName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Billing Name</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={
                              updateOrgMutation.isPending ||
                              !orgForm.formState.isDirty
                            }
                          >
                            {updateOrgMutation.isPending && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Organization
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                You don&apos;t belong to any organizations yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
