import { prisma } from "./prisma.js";

type Params = {
  documentId: string;
  userId: string;
};

export const getDocumentInvitation = async ({ documentId, userId }: Params) => {
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      users: { some: { userId, isAdmin: true } },
    },
    include: {
      documentInvitations: true,
    },
  });

  return document && document.documentInvitations.length > 0
    ? document.documentInvitations[0]
    : null;
};
