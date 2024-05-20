import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { getSession } from "../../db/getSession.js";

const sessionMaxAge = 1000 * 60 * 60 * 24 * 30; // 30 days

// created for each request
export const createContext = async ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => {
  const clearCookie = () => {
    res.clearCookie("session");
  };

  const setSessionCookie = (sessionToken: string) => {
    res.cookie("session", sessionToken, {
      httpOnly: true,
      maxAge: sessionMaxAge,
      ...(process.env.NODE_ENV === "production"
        ? {
            secure: true,
            sameSite: "none",
          }
        : {
            secure: false,
            sameSite: "lax",
          }),
    });
  };
  const sessionToken = req.cookies?.session;
  if (sessionToken) {
    const session = await getSession(sessionToken);
    return { session, clearCookie, setSessionCookie };
  }

  return { session: null, clearCookie, setSessionCookie };
};

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(
  async function isAuthenticated(opts) {
    const { ctx } = opts;
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return opts.next({
      ctx: {
        session: ctx.session,
      },
    });
  }
);
