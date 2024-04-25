import * as trpcExpress from "@trpc/server/adapters/express";
import cors, { CorsOptions } from "cors";
import "dotenv/config";
import express from "express";
import { webSocketServer } from "./automergeRepo/automergeRepo.js";
import { getSession } from "./db/getSession.js";
import { appRouter } from "./trpc/appRouter.js";
import { createContext } from "./trpc/trpc.js";

const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;
const app = express();

app.use(express.json());

const corsOptions: CorsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? "https://automerge-jumpstart.vercel.app"
      : "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

app.use(
  "/api",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.get("/", (_req, res) => {
  res.send(`Server is running`);
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

server.on("upgrade", async (request, socket, head) => {
  let sessionKey: null | string = null;
  // get the query param sessionKey from the request
  const queryStartPos = (request.url || "").indexOf("?");
  if (queryStartPos !== -1) {
    const queryString = request.url?.slice(queryStartPos + 1);
    const queryParameters = new URLSearchParams(queryString);
    sessionKey = queryParameters.get("sessionKey");
  }

  if (!sessionKey) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const session = await getSession(sessionKey);
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
