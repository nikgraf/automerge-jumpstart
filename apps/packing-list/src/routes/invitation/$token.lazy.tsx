import { createLazyFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { trpc } from "../../utils/trpc/trpc";

const Invitation: React.FC = () => {
  const acceptDocumentInvitationMutation =
    trpc.acceptDocumentInvitation.useMutation();
  const { token } = Route.useParams();
  const navigate = Route.useNavigate();

  useEffect(() => {
    acceptDocumentInvitationMutation.mutate(
      {
        token,
      },
      {
        onSuccess: (data) => {
          if (data?.documentId) {
            navigate({ to: `/list/${data.documentId}` });
          }
        },
      }
    );
  }, []);

  return <div>Loading…</div>;
};

export const Route = createLazyFileRoute("/invitation/$token")({
  component: Invitation,
});
