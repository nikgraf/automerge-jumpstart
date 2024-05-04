import { isValidAutomergeUrl, Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { createLazyFileRoute } from "@tanstack/react-router";
import { Checklist } from "../components/Checklist/Checklist";

const syncServer = import.meta.env.PROD
  ? "wss://automerge-packing-list.fly.dev"
  : "ws://localhost:3030";

const repo = new Repo({
  network: [
    new BroadcastChannelNetworkAdapter(),
    new BrowserWebSocketClientAdapter(syncServer),
  ],
  storage: new IndexedDBStorageAdapter(),
});

const Repository = () => {
  const rootDocUrl = `${document.location.hash.substring(1)}`;
  const handle = isValidAutomergeUrl(rootDocUrl) ? repo.find(rootDocUrl) : null;

  if (!handle) {
    return <div>Document not found</div>;
  }

  return (
    <RepoContext.Provider value={repo}>
      <Checklist docUrl={handle.url} />
    </RepoContext.Provider>
  );
};

export const Route = createLazyFileRoute("/checklist")({
  component: Repository,
});
