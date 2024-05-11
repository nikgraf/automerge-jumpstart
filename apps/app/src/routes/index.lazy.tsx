import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    <>
      <form
        className="flex justify-center items-center gap-4 py-4"
        onSubmit={(event) => {
          event.preventDefault();

          createDocumentMutation.mutate(
            // @ts-expect-error form name is defined

            { name: event.target.name.value },
            {
              onSuccess: ({ document }) => {
                documentsQuery.refetch();
                navigate({ to: `/list/${document.id}` });
              },
              onError: () => {
                alert("Failed to create the list");
              },
            }
          );
        }}
      >
        <Input
          type="text"
          name="name"
          placeholder="List name"
          className="max-w-48"
        />
        <Button type="submit">Create List</Button>
      </form>

      <div className="flex flex-col gap-2 pt-4">
        {documentsQuery.data?.map((doc) => (
          <Link to={`/list/${doc.id}`} key={doc.id}>
            <Card className="flex flex-col items-start gap-2 rounded-lg border p-5 text-left text-xl transition-all hover:bg-accent">
              {doc.name}
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
