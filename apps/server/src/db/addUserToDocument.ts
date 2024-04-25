import { getUserHasAccessToDocument } from "./getUserHasAccessToDocument.js";
import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentInvitationToken: string;
};

export const addUserToDocument = async ({
  userId,
  documentInvitationToken,
}: Params) => {
  const documentInvitation = await prisma.documentInvitation.findUniqueOrThrow({
    where: {
      token: documentInvitationToken,
    },
  });
  const hasAccessAlready = await getUserHasAccessToDocument({
    userId,
    documentId: documentInvitation.documentId,
  });

  if (hasAccessAlready) {
    return { documentId: documentInvitation.documentId };
  }

  return prisma.usersOnDocuments.create({
    data: {
      userId,
      documentId: documentInvitation.documentId,
      isAdmin: false,
    },
  });
};
