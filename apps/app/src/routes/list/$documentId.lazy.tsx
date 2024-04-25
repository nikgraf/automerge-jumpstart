import { DocumentMembers } from "@/components/DocumentMembers/DocumentMembers";
import { Input } from "@/components/ui/input";
import { getRepo } from "@/utils/automergeRepo";
import { isValidAutomergeUrl } from "@automerge/automerge-repo";
import { RepoContext } from "@automerge/automerge-repo-react-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { getQueryKey } from "@trpc/react-query";
import { Checklist } from "../../components/Checklist/Checklist";
import { trpc } from "../../utils/trpc";

const Document = () => {
  const repo = getRepo();
  const queryClient = useQueryClient();
  const { documentId } = Route.useParams();
  const rootDocUrl = `automerge:${documentId}`;
  const handle =
    isValidAutomergeUrl(rootDocUrl) && repo ? repo.find(rootDocUrl) : null;
  const getDocumentQuery = trpc.getDocument.useQuery(documentId);
  const documentQueryKey = getQueryKey(trpc.getDocument, handle?.documentId);
  const updateDocumentMutation = trpc.updateDocument.useMutation({
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: documentQueryKey }),
  });

  if (!repo) {
    return null; // add fade-in error for the case repo is never initialized
  }

  if (!handle) {
    return <div>List not found</div>;
  }

  if (handle.isDeleted()) {
    return <div>List deleted</div>;
  }

  if (!handle.isReady()) {
    return null;
  }

  return (
    <RepoContext.Provider value={repo}>
      <div className="flex justify-between gap-4 pb-8 pt-4 items-end flex-wrap">
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

        <DocumentMembers
          documentId={documentId}
          handle={handle}
          currentUserIsAdmin={getDocumentQuery.data?.isAdmin || false}
        />
      </div>
      <Checklist docUrl={handle.url} />
    </RepoContext.Provider>
  );
};

export const Route = createLazyFileRoute("/list/$documentId")({
  component: Document,
});
