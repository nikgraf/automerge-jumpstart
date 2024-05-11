import { Input } from "@/components/ui/input";
import { isValidAutomergeUrl, Repo } from "@automerge/automerge-repo";
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { Checklist } from "../../components/Checklist/Checklist";
import { DocumentInvitation } from "../../components/DocumentInvitation/DocumentInvitation";
import { trpc } from "../../utils/trpc/trpc";

const syncServer = import.meta.env.PROD
  ? "wss://automerge-livelist.fly.dev"
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
  const { documentId } = Route.useParams();
  const rootDocUrl = `automerge:${documentId}`;
  const handle = isValidAutomergeUrl(rootDocUrl) ? repo.find(rootDocUrl) : null;
  const getDocumentQuery = trpc.getDocument.useQuery(documentId);
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
      <div className="flex justify-between gap-4 pb-8 pt-4 items-end">
        {getDocumentQuery.data?.isAdmin ? (
          <Input
            className="max-w-48 text-xl"
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
        ) : (
          <div className="text-xl">{getDocumentQuery.data?.name}</div>
        )}

        {getDocumentQuery.data?.isAdmin ? (
          <DocumentInvitation documentId={documentId} />
        ) : null}
      </div>
      <Checklist docUrl={handle.url} />
    </RepoContext.Provider>
  );
};

export const Route = createLazyFileRoute("/list/$documentId")({
  component: Document,
});
