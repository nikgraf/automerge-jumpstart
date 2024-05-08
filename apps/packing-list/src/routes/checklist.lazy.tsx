import { isValidAutomergeUrl, Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { Checklist } from "../components/Checklist/Checklist";
import { trpc } from "../utils/trpc/trpc";

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

const Document = () => {
  const queryClient = useQueryClient();
  const rootDocUrl = `${document.location.hash.substring(1)}`;
  const handle = isValidAutomergeUrl(rootDocUrl) ? repo.find(rootDocUrl) : null;
  const getDocumentQuery = trpc.getDocument.useQuery(
    handle?.documentId || "invalid"
  );
  const documentQueryKey = getQueryKey(trpc.getDocument, handle?.documentId);
  const updateDocumentMutation = trpc.updateDocument.useMutation({
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: documentQueryKey }),
  });

  if (!handle) {
    return <div>List not found</div>;
  }

  return (
    <RepoContext.Provider value={repo}>
      <input
        value={
          updateDocumentMutation.isPending
            ? updateDocumentMutation.variables.name
            : getDocumentQuery.data?.name || ""
        }
        onChange={(event) => {
          // Note: could be improved by throttling
          updateDocumentMutation.mutate({
            id: handle.documentId,
            name: event.target.value,
          });
        }}
      />
      <Checklist docUrl={handle.url} />
    </RepoContext.Provider>
  );
};

export const Route = createLazyFileRoute("/checklist")({
  component: Document,
});
