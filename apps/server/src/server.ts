import { Repo, RepoConfig } from "@automerge/automerge-repo";
import * as opaque from "@serenity-kit/opaque";
import { PostgresStorageAdapter } from "automerge-repo-storage-postgres";
import cookie from "cookie";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import os from "os";
import pg from "pg";
import { WebSocketServer } from "ws";
import { createDocument } from "./db/createDocument.js";
import { createLoginAttempt } from "./db/createLoginAttempt.js";
import { createSession } from "./db/createSession.js";
import { createUser } from "./db/createUser.js";
import { deleteLoginAttempt } from "./db/deleteLoginAttempt.js";
import { deleteSession } from "./db/deleteSession.js";
import { getDocumentsByUserId } from "./db/getDocumentsByUserId.js";
import { getLoginAttempt } from "./db/getLoginAttempt.js";
import { getSession } from "./db/getSession.js";
import { getUserByUsername } from "./db/getUserByUsername.js";
import {
  LoginFinishParams,
  LoginStartParams,
  RegisterFinishParams,
  RegisterStartParams,
} from "./schema.js";
import { AuthAdapter } from "./utils/AuthAdapter/AuthAdapter.js";
import { generateId } from "./utils/generateId/generateId.js";
import { getOpaqueServerSetup } from "./utils/getOpaqueServerSetup/getOpaqueServerSetup.js";
import { sendError } from "./utils/sendError/sendError.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export class Server {
  #socket: WebSocketServer;

  #server: ReturnType<import("express").Express["listen"]>;

  #readyResolvers: ((value: any) => void)[] = [];

  #isReady = false;

  #repo: Repo;

  constructor() {
    var hostname = os.hostname();

    this.#socket = new WebSocketServer({ noServer: true });

    const PORT =
      process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    // TODO - configure CORS
    const corsOptions = {
      origin: "http://localhost:5173", //(https://your-client-app.com)
      credentials: true,
    };

    app.use(cors(corsOptions));

    app.post("/register/start", async (req, res) => {
      let userIdentifier, registrationRequest;
      try {
        const values = RegisterStartParams.parse(req.body);
        userIdentifier = values.userIdentifier;
        registrationRequest = values.registrationRequest;
      } catch (err) {
        return sendError(res, 400, "Invalid input values");
      }

      const user = await getUserByUsername(userIdentifier);
      if (user) {
        return sendError(res, 400, "user already registered");
      }

      const { registrationResponse } = opaque.server.createRegistrationResponse(
        {
          serverSetup: getOpaqueServerSetup(),
          userIdentifier,
          registrationRequest,
        }
      );

      res.send({ registrationResponse });
      res.end();
    });

    app.post("/register/finish", async (req, res) => {
      let userIdentifier, registrationRecord;
      try {
        const values = RegisterFinishParams.parse(req.body);
        userIdentifier = values.userIdentifier;
        registrationRecord = values.registrationRecord;
      } catch (err) {
        return sendError(res, 400, "Invalid input values");
      }

      const existingUser = await getUserByUsername(userIdentifier);
      if (!existingUser) {
        await createUser({ username: userIdentifier, registrationRecord });
      }

      // return a 200 even if the user already exists to avoid leaking
      // the information if the user exists or not
      res.writeHead(200);
      res.end();
    });

    app.post("/login/start", async (req, res) => {
      let userIdentifier, startLoginRequest;
      try {
        const values = LoginStartParams.parse(req.body);
        userIdentifier = values.userIdentifier;
        startLoginRequest = values.startLoginRequest;
      } catch (err) {
        return sendError(res, 400, "Invalid input values");
      }

      const user = await getUserByUsername(userIdentifier);
      if (!user) return sendError(res, 400, "user not registered");
      const { registrationRecord, id: userId } = user;

      const loginAttempt = await getLoginAttempt(userIdentifier);
      if (loginAttempt) {
        return sendError(res, 400, "login already started");
      }

      const { serverLoginState, loginResponse } = opaque.server.startLogin({
        serverSetup: getOpaqueServerSetup(),
        userIdentifier,
        registrationRecord,
        startLoginRequest,
      });

      await createLoginAttempt({ userId, serverLoginState });

      res.send({ loginResponse });
      res.end();
    });

    app.post("/login/finish", async (req, res) => {
      let userIdentifier, finishLoginRequest;
      try {
        const values = LoginFinishParams.parse(req.body);
        userIdentifier = values.userIdentifier;
        finishLoginRequest = values.finishLoginRequest;
      } catch (err) {
        return sendError(res, 400, "Invalid input values");
      }

      const { serverLoginState } = await getLoginAttempt(userIdentifier);
      if (!serverLoginState) return sendError(res, 400, "login not started");

      const { sessionKey } = opaque.server.finishLogin({
        finishLoginRequest,
        serverLoginState,
      });

      const sessionToken = generateId(32);
      const { id: userId } = await getUserByUsername(userIdentifier);
      await createSession({ token: sessionToken, sessionKey, userId });
      await deleteLoginAttempt(userId);

      res.cookie("session", sessionToken, { httpOnly: true });
      res.writeHead(200);
      res.end();
    });

    app.post("/logout", async (req, res) => {
      const sessionToken = req.cookies.session;
      if (!sessionToken) return sendError(res, 401, "not authorized");

      const session = await getSession(sessionToken);
      if (!session) return sendError(res, 401, "invalid session");

      await deleteSession(sessionToken);

      res.clearCookie("session");
      res.end();
    });

    app.post("/me", async (req, res) => {
      const sessionToken = req.cookies?.session;
      if (!sessionToken) return sendError(res, 401, "not authorized");

      const session = await getSession(sessionToken);
      if (!session) return sendError(res, 401, "invalid session");

      res.writeHead(200);
      res.end();
    });

    app.get("/documents", async (req, res) => {
      const sessionToken = req.cookies?.session;
      if (!sessionToken) return sendError(res, 401, "not authorized");

      const session = await getSession(sessionToken);
      if (!session) return sendError(res, 401, "invalid session");

      const documents = await getDocumentsByUserId(session.userId);

      res.send({ documents });
      res.end();
    });

    app.post("/documents", async (req, res) => {
      const sessionToken = req.cookies?.session;
      if (!sessionToken) return sendError(res, 401, "not authorized");

      const session = await getSession(sessionToken);
      if (!session) return sendError(res, 401, "invalid session");

      const { documentId } = this.#repo.create();

      const document = await createDocument({
        userId: session.userId,
        documentId,
      });

      res.send({ document });
      res.end();
    });

    const config: RepoConfig = {
      // network: [new AuthNodeWsServerAdapter(this.#socket)],
      network: [new AuthAdapter(this.#socket)],
      storage: new PostgresStorageAdapter("DocumentData", pool),
      // @ts-expect-error
      peerId: `storage-server-${hostname}`,
      sharePolicy: async () => false,
    };
    this.#repo = new Repo(config);

    app.get("/", (req, res) => {
      res.send(`Server is running`);
    });

    this.#server = app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
      this.#isReady = true;
      this.#readyResolvers.forEach((resolve) => resolve(true));
    });

    this.#server.on("upgrade", async (request, socket, head) => {
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

      this.#socket.handleUpgrade(request, socket, head, (socket) => {
        // @ts-expect-error adding the session to the socket so we can access it in the network adapter
        socket.session = session;
        this.#socket.emit("connection", socket, request);
      });
    });
  }

  async ready() {
    if (this.#isReady) {
      return true;
    }

    return new Promise((resolve) => {
      this.#readyResolvers.push(resolve);
    });
  }

  close() {
    this.#socket.close();
    this.#server.close();
  }
}
