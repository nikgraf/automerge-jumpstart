import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentInvitationToken: string;
};

export const addUserToDocument = async ({
  userId,
  documentInvitationToken,
}: Params) => {
  const documentInvitation = await prisma.documentInvitation.findUnique({
    where: {
      token: documentInvitationToken,
    },
  });

  return prisma.usersOnDocuments.create({
    data: {
      userId: userId,
      documentId: documentInvitation.documentId,
      isAdmin: false,
    },
  });
};
