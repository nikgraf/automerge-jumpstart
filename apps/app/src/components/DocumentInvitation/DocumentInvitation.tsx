import React from "react";
import { trpc } from "../../utils/trpc/trpc";

type Props = {
  documentId: string;
};

export const DocumentInvitation: React.FC<Props> = ({ documentId }) => {
  const documentInvitationQuery = trpc.documentInvitation.useQuery(documentId);
  const createOrRefreshDocumentInvitationMutation =
    trpc.createOrRefreshDocumentInvitation.useMutation();

  return (
    <div>
      <div>{`${window.location.origin}/invitation/${documentInvitationQuery.data?.token}`}</div>
      <button
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
        Refresh
      </button>
    </div>
  );
};
