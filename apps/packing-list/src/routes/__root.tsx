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

const Root = () => {
  const navigate = useNavigate();

  const meQuery = trpc.me.useQuery(undefined, {
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
            <Link to="/login" className="[&.active]:font-bold">
              Login
            </Link>
            <Link to="/register" className="[&.active]:font-bold">
              Register
            </Link>
          </>
        ) : null}

        {meQuery.data && !isNotAuthorized ? (
          <>
            <Link to="/" className="[&.active]:font-bold">
              Home
            </Link>

            <span>{meQuery.data.username}</span>

            <button
              onClick={async () => {
                removeLocalDb();
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    // delete again to verify in case new info came in during the logout request
                    removeLocalDb();
                    queryClient.invalidateQueries();
                    navigate({ to: "/" });
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
