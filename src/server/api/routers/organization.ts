import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { organizationService } from "../services/organization.service";
import { createOrganizationSchema } from "../schemas/organization.schema";

export const organizationRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrganizationSchema)
    .mutation(({ ctx, input }) => {
      return organizationService.create({ ctx, input });
    }),
});
