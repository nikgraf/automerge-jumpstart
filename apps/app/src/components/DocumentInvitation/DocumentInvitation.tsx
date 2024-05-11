import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCcw } from "lucide-react";
import React, { useId } from "react";
import { trpc } from "../../utils/trpc/trpc";

type Props = {
  documentId: string;
};

export const DocumentInvitation: React.FC<Props> = ({ documentId }) => {
  const documentInvitationQuery = trpc.documentInvitation.useQuery(documentId);
  const createOrRefreshDocumentInvitationMutation =
    trpc.createOrRefreshDocumentInvitation.useMutation();

  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="text-xs">
        Invitation link
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={`${window.location.origin}/invitation/${documentInvitationQuery.data?.token}`}
          onFocus={(event) => event.target.select()}
          className="min-w-64"
        />
        <Button
          onClick={() =>
            createOrRefreshDocumentInvitationMutation.mutate(
              {
                documentId,
              },
              {
                onSuccess: () => {
                  documentInvitationQuery.refetch();
                },
              }
            )
          }
        >
          <RefreshCcw />
        </Button>
      </div>
    </div>
  );
};
