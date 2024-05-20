import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { CircleCheckBig } from "lucide-react";
import { removeLocalDb } from "../utils/removeLocalDb/removeLocalDb";
import { trpc } from "../utils/trpc/trpc";

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
          LiveList
          <span>(Demo)</span>
        </Link>
        <div className="flex gap-4 items-center justify-between">
          {(!meQuery.data && !meQuery.isLoading) || isNotAuthorized ? (
            <>
              <Link to="/login" search={{ redirect: getRedirectParam() }}>
                Login
              </Link>
              <Link to="/register" search={{ redirect: getRedirectParam() }}>
                Register
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
                      // delete again to verify in case new info came in during the logout request
                      removeLocalDb();
                      queryClient.invalidateQueries();
                      navigate({ to: "/login" });
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
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({
  component: Root,
});
