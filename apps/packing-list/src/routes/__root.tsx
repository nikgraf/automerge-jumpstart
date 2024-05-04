import {
  createRootRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { request } from "../utils/request/request";

const Root = () => {
  const [authStatus, setAuthStatus] = useState("loading");
  const navigate = useNavigate();

  useEffect(() => {
    request("POST", "/me")
      .then(() => {
        setAuthStatus("authenticated");
      })
      .catch(() => {
        setAuthStatus("unauthenticated");
      });
  }, []);

  return (
    <>
      <div className="p-2 flex gap-2">
        {authStatus === "unauthenticated" ? (
          <>
            <Link to="/login" className="[&.active]:font-bold">
              Login
            </Link>
            <Link to="/register" className="[&.active]:font-bold">
              Register
            </Link>
          </>
        ) : null}

        {authStatus === "authenticated" ? (
          <>
            <Link to="/" className="[&.active]:font-bold">
              Home
            </Link>

            <button
              onClick={async () => {
                indexedDB.deleteDatabase("automerge");
                const res = await request("POST", "/logout");
                if (res.status === 200) {
                  setAuthStatus("unauthenticated");
                  // delete again to verify in case new info came in during the logout request
                  indexedDB.deleteDatabase("automerge");
                  navigate({ to: "/" });
                } else {
                  alert("Failed to logout");
                }
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
