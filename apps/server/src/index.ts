import { Repo, RepoConfig } from "@automerge/automerge-repo";
import * as opaque from "@serenity-kit/opaque";
import { TRPCError } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import { PostgresStorageAdapter } from "automerge-repo-storage-postgres";
import cookie from "cookie";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import os from "os";
import pg from "pg";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { createDocument } from "./db/createDocument.js";
import { createLoginAttempt } from "./db/createLoginAttempt.js";
import { createSession } from "./db/createSession.js";
import { createUser } from "./db/createUser.js";
import { deleteLoginAttempt } from "./db/deleteLoginAttempt.js";
import { deleteSession } from "./db/deleteSession.js";
import { getDocument } from "./db/getDocument.js";
import { getDocumentsByUserId } from "./db/getDocumentsByUserId.js";
import { getLoginAttempt } from "./db/getLoginAttempt.js";
import { getSession } from "./db/getSession.js";
import { getUser } from "./db/getUser.js";
import { getUserByUsername } from "./db/getUserByUsername.js";
import { updateDocument } from "./db/updateDocument.js";
import {
  LoginFinishParams,
  LoginStartParams,
  RegisterFinishParams,
  RegisterStartParams,
} from "./schema.js";
import { AuthAdapter } from "./utils/AuthAdapter/AuthAdapter.js";
import { generateId } from "./utils/generateId/generateId.js";
import { getOpaqueServerSetup } from "./utils/getOpaqueServerSetup/getOpaqueServerSetup.js";
import {
  createContext,
  protectedProcedure,
  publicProcedure,
  router,
} from "./utils/trpc/trpc.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const webSocketServer = new WebSocketServer({ noServer: true });
const hostname = os.hostname();
const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;
const app = express();

app.use(express.json());
app.use(cookieParser());

// TODO - configure CORS
const corsOptions = {
  origin: "http://localhost:5173", //(https://your-client-app.com)
  credentials: true,
};

app.use(cors(corsOptions));

const appRouter = router({
  me: protectedProcedure.query(async (opts) => {
    const user = await getUser(opts.ctx.session.userId);
    return { id: user.id, username: user.username };
  }),
  documents: protectedProcedure.query(async (opts) => {
    const documents = await getDocumentsByUserId(opts.ctx.session.userId);
    return documents.map((doc) => ({ id: doc.id, name: doc.name }));
  }),
  getDocument: protectedProcedure.input(z.string()).query(async (opts) => {
    const document = await getDocument({
      documentId: opts.input,
      userId: opts.ctx.session.userId,
    });
    return { id: document.id, name: document.name };
  }),
  updateDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async (opts) => {
      const updatedDocument = await updateDocument({
        documentId: opts.input.id,
        userId: opts.ctx.session.userId,
        name: opts.input.name,
      });
      return { id: updatedDocument.id, name: updatedDocument.name };
    }),
  createDocument: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { documentId } = repo.create();
      const document = await createDocument({
        userId: opts.ctx.session.userId,
        documentId,
        name: opts.input.name,
      });
      return { document: { id: document.id, name: document.name } };
    }),
  logout: protectedProcedure.mutation(async (opts) => {
    await deleteSession(opts.ctx.session.token);
    opts.ctx.clearCookie();
  }),

  registerStart: publicProcedure
    .input(RegisterStartParams)
    .mutation(async (opts) => {
      const { userIdentifier, registrationRequest } = opts.input;

      const user = await getUserByUsername(userIdentifier);
      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user already registered",
        });
      }

      const { registrationResponse } = opaque.server.createRegistrationResponse(
        {
          serverSetup: getOpaqueServerSetup(),
          userIdentifier,
          registrationRequest,
        }
      );

      return { registrationResponse };
    }),

  registerFinish: publicProcedure
    .input(RegisterFinishParams)
    .mutation(async (opts) => {
      const { userIdentifier, registrationRecord } = opts.input;

      const existingUser = await getUserByUsername(userIdentifier);
      if (!existingUser) {
        await createUser({ username: userIdentifier, registrationRecord });
      }

      // return always the same result even if the user already exists to
      // avoid leaking the information if the user exists or not
      return;
    }),

  loginStart: publicProcedure.input(LoginStartParams).mutation(async (opts) => {
    const { userIdentifier, startLoginRequest } = opts.input;

    const user = await getUserByUsername(userIdentifier);
    if (!user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user not registered",
      });
    const { registrationRecord, id: userId } = user;

    const loginAttempt = await getLoginAttempt(userIdentifier);
    if (loginAttempt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "login already started",
      });
    }

    const { serverLoginState, loginResponse } = opaque.server.startLogin({
      serverSetup: getOpaqueServerSetup(),
      userIdentifier,
      registrationRecord,
      startLoginRequest,
    });

    await createLoginAttempt({ userId, serverLoginState });

    return { loginResponse };
  }),
  loginFinish: publicProcedure
    .input(LoginFinishParams)
    .mutation(async (opts) => {
      const { userIdentifier, finishLoginRequest } = opts.input;

      const { serverLoginState } = await getLoginAttempt(userIdentifier);
      if (!serverLoginState)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "login not started",
        });

      const { sessionKey } = opaque.server.finishLogin({
        finishLoginRequest,
        serverLoginState,
      });

      const sessionToken = generateId(32);
      const { id: userId } = await getUserByUsername(userIdentifier);
      await createSession({ token: sessionToken, sessionKey, userId });
      await deleteLoginAttempt(userId);

      opts.ctx.setSessionCookie(sessionToken);
      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;

app.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const config: RepoConfig = {
  network: [new AuthAdapter(webSocketServer)],
  storage: new PostgresStorageAdapter("DocumentData", pool),
  // @ts-expect-error
  peerId: `storage-server-${hostname}`,
  sharePolicy: async () => false,
};
const repo = new Repo(config);

app.get("/", (req, res) => {
  res.send(`Server is running`);
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

server.on("upgrade", async (request, socket, head) => {
  // validating the session
  const cookies = cookie.parse(request.headers.cookie || "");
  const sessionToken = cookies.session;
  if (!sessionToken) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const session = await getSession(sessionToken);
  if (!session) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  webSocketServer.handleUpgrade(request, socket, head, (currentSocket) => {
    // @ts-expect-error adding the session to the socket so we can access it in the network adapter
    currentSocket.session = session;
    webSocketServer.emit("connection", currentSocket, request);
  });
});
