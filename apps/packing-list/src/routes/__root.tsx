import { useQueryClient } from "@tanstack/react-query";
import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { removeLocalDb } from "../utils/removeLocalDb/removeLocalDb";
import { trpc } from "../utils/trpc/trpc";

const getRedirectParam = () => {
  const currentUrl = window.location.href;
  const urlParams = new URLSearchParams(new URL(currentUrl).search);
  return urlParams.get("redirect") || undefined;
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
      <div className="p-2 flex gap-2">
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
            <Link to="/">Home</Link>

            <span>{meQuery.data.username}</span>

            <button
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
            </button>
          </>
        ) : null}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
};

export const Route = createRootRoute({
  component: Root,
});
