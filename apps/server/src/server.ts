import { Repo, RepoConfig } from "@automerge/automerge-repo";
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket";
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
import express from "express";
import fs from "fs";
import os from "os";
import { WebSocketServer } from "ws";

export class Server {
  #socket: WebSocketServer;

  #server: ReturnType<import("express").Express["listen"]>;

  #readyResolvers: ((value: any) => void)[] = [];

  #isReady = false;

  #repo: Repo;

  constructor() {
    const dir =
      process.env.DATA_DIR !== undefined ? process.env.DATA_DIR : ".amrg";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    var hostname = os.hostname();

    this.#socket = new WebSocketServer({ noServer: true });

    const PORT =
      process.env.PORT !== undefined ? parseInt(process.env.PORT) : 3030;
    const app = express();
    app.use(express.static("public"));

    const config: RepoConfig = {
      network: [new NodeWSServerAdapter(this.#socket)],
      storage: new NodeFSStorageAdapter(dir),
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
