import { z } from "zod";

export const organizationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().url("Invalid website URL").optional(),
  ownerId: z.string().optional(),
});

export const createOrganizationSchema = organizationSchema.omit({
  id: true,
  ownerId: true,
});

export const getOrganizationByIdSchema = z.object({
  id: z.string(),
});

export type IOrganization = z.infer<typeof organizationSchema>;
export type ICreateOrganization = z.infer<typeof createOrganizationSchema>;
