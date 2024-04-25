import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "../../../server/src/trpc/appRouter.js";
import { apiProductionHost } from "../constants.js";

const apiUrl = import.meta.env.PROD
  ? `https://${apiProductionHost}/api`
  : "http://localhost:3030/api";

export const trpc = createTRPCReact<AppRouter>();

let authorizationToken: string | null = localStorage.getItem("sessionKey");

export function setAuthorizationToken(newToken: string) {
  authorizationToken = newToken;
  localStorage.setItem("sessionKey", authorizationToken);
}

export function clearAuthorizationToken() {
  authorizationToken = null;
  localStorage.removeItem("sessionKey");
}

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: apiUrl,
      headers: () => {
        const sessionKey = localStorage.getItem("sessionKey");
        return sessionKey ? { Authorization: sessionKey } : {};
      },
    }),
  ],
});
