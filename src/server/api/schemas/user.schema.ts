import { z } from "zod";

// Schema for user profile update
export const userProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format").optional(),
  image: z.string().url().optional().nullable(),
  defaultOrganizationId: z.string().optional().nullable(),
});

// Schema for getting user by ID
export const getUserByIdSchema = z.object({
  id: z.string(),
});

// Schema for updating user profile
export const updateUserProfileSchema = userProfileSchema.omit({ email: true });

// Type inference
export type UserProfile = z.infer<typeof userProfileSchema>;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
