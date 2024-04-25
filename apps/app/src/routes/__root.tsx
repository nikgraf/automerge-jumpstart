import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { CircleCheckBig } from "lucide-react";
import { lazy, Suspense, useLayoutEffect } from "react";
import { removeLocalDb } from "../utils/removeLocalDb";
import { clearAuthorizationToken, trpc } from "../utils/trpc";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // render nothing in production
    : lazy(() =>
        // lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
        }))
      );

const getRedirectParam = () => {
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(new URL(currentUrl).search);
  const redirectParam = urlParams.get("redirect") || undefined;
  if (redirectParam !== "/login" && redirectParam !== "/register") {
    return redirectParam;
  }
};

const Root = () => {
  const navigate = useNavigate();

  // on page load immediately redirect to login
  // if no authorizationToken is available
  useLayoutEffect(() => {
    if (!localStorage.getItem("authorizationToken")) {
      navigate({
        to: "/login",
        search:
          window.location.pathname !== "/" &&
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
            ? { redirect: window.location.pathname }
            : undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meQuery = trpc.me.useQuery(undefined, {
    // avoid lot's of retries in case of unauthorized blocking a page load
    retry: (failureCount, error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        return false;
      }
      if (failureCount > 3) return false;
      return true;
    },
  });
  const logoutMutation = trpc.logout.useMutation();
  const queryClient = useQueryClient();

  const isNotAuthorized = meQuery.error?.data?.code === "UNAUTHORIZED";

  return (
    <>
      <div className="p-5 flex gap-4 items-center justify-between border-b">
        <Link to="/" className="text-xl flex items-center gap-2">
          <CircleCheckBig />
          Automerge Jumpstart
          <span>(Demo)</span>
        </Link>
        <div className="flex gap-4 items-center justify-between">
          {(!meQuery.data && !meQuery.isLoading) || isNotAuthorized ? (
            <>
              <Link to="/login" search={{ redirect: getRedirectParam() }}>
                Login
              </Link>
              <Link to="/register" search={{ redirect: getRedirectParam() }}>
                Sign up
              </Link>
            </>
          ) : null}

          {meQuery.data && !isNotAuthorized ? (
            <>
              <div>{meQuery.data.username}</div>

              <Button
                // not perfect but good enough since the local changes are fast
                disabled={logoutMutation.isPending}
                onClick={async () => {
                  removeLocalDb();
                  logoutMutation.mutate(undefined, {
                    onSuccess: () => {
                      clearAuthorizationToken();
                      // delete again to verify in case new info came in during the logout request
                      removeLocalDb();
                      queryClient.invalidateQueries();
                      // navigate({ to: "/login" });
                      // need to do a hard-reload of the page since it's not possible to
                      // properly cleanup automerge-repo and it will continue trying to reconnect
                      window.location.href = `/login`;
                    },
                    onError: () => {
                      alert("Failed to logout");
                    },
                  });
                }}
              >
                Logout
              </Button>
            </>
          ) : null}
        </div>
      </div>
      <div className="p-5">
        <Outlet />
      </div>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>{" "}
    </>
  );
};

export const Route = createRootRoute({
  component: Root,
});
