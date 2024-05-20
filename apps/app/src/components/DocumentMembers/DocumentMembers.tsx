import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOnlineUsers } from "@/hooks/useOnlineUsers/useOnlineUsers";
import { trpc } from "@/utils/trpc/trpc";
import { DocHandle } from "@automerge/automerge-repo";
import { Settings } from "lucide-react";
import { DocumentInvitation } from "../../components/DocumentInvitation/DocumentInvitation";

type Props = {
  documentId: string;
  handle: DocHandle<unknown> | null;
  currentUserIsAdmin: boolean;
};

export const DocumentMembers: React.FC<Props> = ({
  documentId,
  handle,
  currentUserIsAdmin,
}) => {
  const documentMembersQuery = trpc.documentMembers.useQuery(documentId);
  const meQuery = trpc.me.useQuery();
  const onlineUsers = useOnlineUsers(handle);

  const visibleUsers = documentMembersQuery.data
    ? documentMembersQuery.data.slice(0, 5)
    : [];
  const moreUsersCount = documentMembersQuery.data
    ? documentMembersQuery.data.length - visibleUsers.length
    : 0;

  return (
    <div className="flex">
      <div className="flex -space-x-3">
        {visibleUsers.map((user) => {
          const isOnline =
            meQuery.data?.id === user.id ||
            onlineUsers.find((onlineUser) => onlineUser.id === user.id);
          return (
            <Avatar
              key={user.id}
              className={`border-2 ${isOnline ? "border-green-400" : "border-red-400"}`}
            >
              <AvatarFallback>
                {user.username.substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          );
        })}
        {moreUsersCount !== 0 && (
          <Avatar className="border-2 border-gray-500">
            <AvatarFallback>+{moreUsersCount}</AvatarFallback>
          </Avatar>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="ml-2" variant="outline">
            <Settings />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-96">
          {currentUserIsAdmin ? (
            <>
              <DocumentInvitation documentId={documentId} />
              <div className="mb-4" />
            </>
          ) : null}
          <h3 className="text-sm">Members</h3>
          <ul className="pt-2 flex flex-col gap-2">
            {documentMembersQuery.data?.map((user) => {
              const isOnline =
                meQuery.data?.id === user.id ||
                onlineUsers.find((onlineUser) => onlineUser.id === user.id);
              return (
                <li key={user.id} className="flex gap-4 items-center">
                  <Avatar
                    className={`border-2 ${isOnline ? "border-green-400" : "border-red-400"}`}
                  >
                    <AvatarFallback>
                      {user.username.substring(0, 1).toUpperCase()}{" "}
                    </AvatarFallback>
                  </Avatar>
                  {user.username}
                  {user.isAdmin ? "(admin)" : ""}
                </li>
              );
            })}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};
