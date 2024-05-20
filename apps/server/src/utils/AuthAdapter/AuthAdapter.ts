import { cbor as cborHelpers } from "@automerge/automerge-repo";
import {
  FromClientMessage,
  NodeWSServerAdapter,
} from "@automerge/automerge-repo-network-websocket";
import WebSocket from "isomorphic-ws";
import { getUserHasAccessToDocument } from "../../db/getUserHasAccessToDocument.js";

const { decode } = cborHelpers;

export class AuthAdapter extends NodeWSServerAdapter {
  async receiveMessage(messageBytes: Uint8Array, socket: WebSocket) {
    const message: FromClientMessage = decode(messageBytes);

    if ("documentId" in message) {
      const hasAccess = await getUserHasAccessToDocument({
        // @ts-expect-error session is set on the socket
        userId: socket.session.userId,
        documentId: message.documentId as string,
      });
      if (!hasAccess) {
        return;
      }

      // check for invalid awareness messages
      if (message.type === "ephemeral" && message.data) {
        const data: { type: string; userId: string } = decode(message.data);
        if (
          data.type !== "awareness" ||
          // @ts-expect-error session is set on the socket
          data.userId !== socket.session.userId
        ) {
          return;
        }
      }
    }

    super.receiveMessage(messageBytes, socket);
  }
}
