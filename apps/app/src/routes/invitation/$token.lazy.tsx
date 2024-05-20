import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createLazyFileRoute } from "@tanstack/react-router";
import { trpc } from "../../utils/trpc/trpc";

const Invitation: React.FC = () => {
  const acceptDocumentInvitationMutation =
    trpc.acceptDocumentInvitation.useMutation();
  const { token } = Route.useParams();
  const navigate = Route.useNavigate();

  const acceptInvitation = () => {
    acceptDocumentInvitationMutation.mutate(
      { token },
      {
        onError: () => {
          alert("Failed to accept invitation. Please try again.");
        },
        onSuccess: (data) => {
          if (data?.documentId) {
            navigate({ to: `/list/${data.documentId}` });
          }
        },
      }
    );
  };

  return (
    <Card className="p-4">
      <p className="mb-4">Accept the invitation to this list.</p>
      <Button
        disabled={acceptDocumentInvitationMutation.isPending}
        onClick={acceptInvitation}
      >
        Accept Invitation
      </Button>
    </Card>
  );
};

export const Route = createLazyFileRoute("/invitation/$token")({
  component: Invitation,
});
