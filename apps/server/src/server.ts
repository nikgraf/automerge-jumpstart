import { Repo, RepoConfig } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { PrismaClient } from "@prisma/client";
import { PostgresStorageAdapter } from "automerge-repo-storage-postgres";
import express from "express";
import os from "os";
import pg from "pg";
import { WebSocketServer } from "ws";

const prisma = new PrismaClient();

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
    app.use(express.static("public"));

    const config: RepoConfig = {
      network: [new NodeWSServerAdapter(this.#socket)],
      storage: new PostgresStorageAdapter("Repository", pool),
      // @ts-expect-error
      peerId: `storage-server-${hostname}`,
      sharePolicy: async () => false,
    };
    this.#repo = new Repo(config);

    app.get("/", (req, res) => {
      res.send(`server is running`);
    });

    this.#server = app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
      this.#isReady = true;
      this.#readyResolvers.forEach((resolve) => resolve(true));
    });

    this.#server.on("upgrade", (request, socket, head) => {
      this.#socket.handleUpgrade(request, socket, head, (socket) => {
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
