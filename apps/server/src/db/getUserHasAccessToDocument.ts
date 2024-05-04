import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentId: string;
};

export const getUserHasAccessToDocument = async ({
  documentId,
  userId,
}: Params) => {
  if (!userId) return false;
  if (!documentId) return false;
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      ownerId: userId,
    },
  });
  if (document) return true;
  return false;
};
