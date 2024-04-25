import { Repo, RepoConfig } from "@automerge/automerge-repo";
import { PostgresStorageAdapter } from "automerge-repo-storage-postgres";
import os from "os";
import pg from "pg";
import { WebSocketServer } from "ws";
import { AuthAdapter } from "./authAdapter.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const webSocketServer = new WebSocketServer({ noServer: true });

const hostname = os.hostname();
const config: RepoConfig = {
  network: [new AuthAdapter(webSocketServer)],
  storage: new PostgresStorageAdapter("DocumentData", pool),
  // @ts-expect-error
  peerId: `storage-server-${hostname}`,
  sharePolicy: async () => false,
};

export const repo = new Repo(config);
