"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useMemo, useRef, useEffect } from "react";
import SuperJSON from "superjson";

import { type AppRouter } from "@/server/api/root";
import { createQueryClient } from "./query-client";
import { useOrganization } from "@/hooks/useOrganization";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= createQueryClient());
};

export const api = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCInnerProvider queryClient={queryClient}>
        {props.children}
      </TRPCInnerProvider>
    </QueryClientProvider>
  );
}

function OrganizationLoader({
  children,
  selectedOrgIdRef,
}: {
  children: React.ReactNode;
  selectedOrgIdRef: React.MutableRefObject<string | null | undefined>;
}) {
  const { selectedOrgId } = useOrganization();

  useEffect(() => {
    selectedOrgIdRef.current = selectedOrgId;
  }, [selectedOrgId, selectedOrgIdRef]);

  return <>{children}</>;
}

function TRPCInnerProvider(props: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  const selectedOrgIdRef = useRef<string | null | undefined>(undefined);

  const trpcClient = useMemo(
    () =>
      api.createClient({
        links: [
          loggerLink({
            enabled: (op) =>
              process.env.NODE_ENV === "development" ||
              (op.direction === "down" && op.result instanceof Error),
          }),
          unstable_httpBatchStreamLink({
            transformer: SuperJSON,
            url: getBaseUrl() + "/api/trpc",
            headers: () => {
              const headers = new Headers();
              headers.set("x-trpc-source", "nextjs-react");

              if (selectedOrgIdRef.current) {
                headers.set("X-Organization-Id", selectedOrgIdRef.current);
              }
              return headers;
            },
          }),
        ],
      }),
    [],
  );

  return (
    <api.Provider client={trpcClient} queryClient={props.queryClient}>
      <OrganizationLoader selectedOrgIdRef={selectedOrgIdRef}>
        {props.children}
      </OrganizationLoader>
    </api.Provider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}
