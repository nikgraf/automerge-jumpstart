import { Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { apiProductionHost } from "../constants";

let repo: Repo | undefined;
let browserWebSocketClientAdapter: BrowserWebSocketClientAdapter | undefined;

export const initializeRepo = (sessionKey: string | null) => {
  // disconnect the previous websocket connection
  if (browserWebSocketClientAdapter) {
    browserWebSocketClientAdapter.disconnect();
    browserWebSocketClientAdapter.socket?.close();
  }

  const authorizationToken = sessionKey;
  const syncServerUrl = import.meta.env.PROD
    ? `wss://${apiProductionHost}?sessionKey=${authorizationToken}`
    : `ws://localhost:3030?sessionKey=${authorizationToken}`;

  browserWebSocketClientAdapter = new BrowserWebSocketClientAdapter(
    syncServerUrl
  );

  repo = new Repo({
    network: [
      new BroadcastChannelNetworkAdapter(),
      browserWebSocketClientAdapter,
    ],
    storage: new IndexedDBStorageAdapter(),
  });
};

// DO NOT USE - not working properly
// see https://github.com/automerge/automerge-repo/issues/357
export const removeRepo = () => {
  // disconnect the previous websocket connection
  if (browserWebSocketClientAdapter) {
    browserWebSocketClientAdapter.disconnect();
    browserWebSocketClientAdapter.socket?.close();
  }

  if (repo) {
    repo = undefined;
  }
};

export const getRepo = () => repo;

if (localStorage.getItem("sessionKey")) {
  initializeRepo(localStorage.getItem("sessionKey"));
}
