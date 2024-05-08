import { Link, createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { trpc } from "../utils/trpc/trpc";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const documentsQuery = trpc.documents.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const createDocumentMutation = trpc.createDocument.useMutation();
  const navigate = useNavigate();

  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
      {documentsQuery.data?.map((doc) => (
        <div key={doc.id}>
          <Link to={`/checklist#automerge:${doc.id}`}>{doc.name}</Link>
        </div>
      ))}

      <form
        onSubmit={(event) => {
          event.preventDefault();

          createDocumentMutation.mutate(
            // @ts-expect-error form name is defined

            { name: event.target.name.value },
            {
              onSuccess: ({ document }) => {
                documentsQuery.refetch();
                navigate({ to: `/checklist#automerge:${document.id}` });
              },
              onError: () => {
                alert("Failed to create the list");
              },
            }
          );
        }}
      >
        <input type="text" name="name" />
        <button type="submit">Create Document</button>
      </form>
    </div>
  );
}
