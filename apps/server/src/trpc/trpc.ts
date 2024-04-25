import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { getSession } from "../db/getSession.js";

// created for each request
export const createContext = async ({
  req,
}: trpcExpress.CreateExpressContextOptions) => {
  if (req.headers.authorization) {
    const session = await getSession(req.headers.authorization);
    return { session };
  }

  return { session: null };
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
