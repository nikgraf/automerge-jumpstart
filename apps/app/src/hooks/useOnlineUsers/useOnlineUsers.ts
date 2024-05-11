import { trpc } from "@/utils/trpc/trpc";
import { DocHandle } from "@automerge/automerge-repo";
import { useEffect, useState } from "react";
import { useInterval } from "../useInterval/useInterval";

export type OnlineUser = {
  id: string;
  lastSeen: Date;
};

export const useOnlineUsers = (handle: DocHandle<unknown> | null) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const meQuery = trpc.me.useQuery();

  // send awareness messages every 4 seconds
  useInterval(() => {
    if (handle && meQuery.data?.id) {
      handle.broadcast({
        type: "awareness",
        userId: meQuery.data.id,
      });
    }
  }, 5000);

  // filter users not seen for 12 seconds
  useInterval(() => {
    setOnlineUsers((prev) => {
      return (
        prev
          // filter out users not seen for 11 seconds
          .filter((user) => {
            return new Date().getTime() - user.lastSeen.getTime() < 11000;
          })
          // sort to have a stable list
          .sort((a, b) => {
            return a.id.localeCompare(b.id);
          })
      );
    });
  }, 12000);

  useEffect(() => {
    if (handle) {
      // can be improved by parsing the message using zod or effect/schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handle.on("ephemeral-message", (message: any) => {
        if (message.message.type === "awareness") {
          setOnlineUsers((prev) => {
            // update user if already seen or add new user to the list
            return [
              ...prev.filter((user) => user.id !== message.message.userId),
              {
                id: message.message.userId,
                lastSeen: new Date(),
              },
            ].sort((a, b) => {
              return a.id.localeCompare(b.id);
            });
          });
        }
      });
    }
    return () => {
      handle?.off("ephemeral-message");
    };
  });

  return onlineUsers;
};
