import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import { useState } from "react";
import { removeLocalDb } from "../../utils/removeLocalDb.js";
import { router } from "../../utils/router.js";
import { clearAuthorizationToken, trpc, trpcClient } from "../../utils/trpc.js";

const handleError = (error: Error, queryClient: QueryClient) => {
  if (
    error instanceof TRPCClientError &&
    error.data?.code === "UNAUTHORIZED" &&
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register"
  ) {
    clearAuthorizationToken();
    removeLocalDb();
    queryClient.clear();

    // need to do a hard-reload of the page since it's not possible to
    // properly cleanup automerge-repo and it will continue trying to reconnect
    window.location.href = `/login${window.location.pathname !== "/" ? `?redirect=${window.location.pathname}` : ""}`;

    // router.navigate({
    //   to: "/login",
    //   search:
    //     window.location.pathname !== "/"
    //       ? { redirect: window.location.pathname }
    //       : undefined,
    // });

    return true;
  }
  // Note: here a global error handler could be implemented e.g. using a toast

  return false;
};

export const App: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            handleError(error, queryClient);
          },
        }),
        mutationCache: new MutationCache({
          onError: (error) => {
            handleError(error, queryClient);
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount: number, error: Error) => {
              const handled = handleError(error, queryClient);
              if (handled) {
                return false;
              }

              return failureCount < 3;
            },
          },
          mutations: {
            retry: (failureCount: number, error: Error) => {
              const handled = handleError(error, queryClient);
              if (handled) {
                return false;
              }

              return failureCount < 3;
            },
          },
        },
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
