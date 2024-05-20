import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { TRPCClientError, httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { apiProductionHost } from "../../constants.js";
import { removeLocalDb } from "../../utils/removeLocalDb/removeLocalDb.js";
import { router } from "../../utils/router/router.js";
import { trpc } from "../../utils/trpc/trpc.js";

const apiUrl = import.meta.env.PROD
  ? `https://${apiProductionHost}/api`
  : "http://localhost:3030/api";

export const App: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (
              error instanceof TRPCClientError &&
              error.data?.code === "UNAUTHORIZED" &&
              window.location.pathname !== "/login"
            ) {
              removeLocalDb();
              queryClient.clear();
              router.navigate({
                to: "/login",
                search: { redirect: window.location.pathname },
              });
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (
              error instanceof TRPCClientError &&
              error.data?.code === "UNAUTHORIZED" &&
              window.location.pathname !== "/login"
            ) {
              removeLocalDb();
              queryClient.clear();
              router.navigate({
                to: "/login",
                search: { redirect: window.location.pathname },
              });
            }
          },
        }),
      })
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: apiUrl,
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: "include",
            });
          },
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
