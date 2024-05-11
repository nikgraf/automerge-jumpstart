import { prisma } from "./prisma.js";

type Params = {
  documentId: string;
  userId: string;
  name: string;
};

export const updateDocument = async ({ documentId, userId, name }: Params) => {
  const document = await prisma.document.update({
    data: {
      name,
    },
    where: {
      id: documentId,
      users: { some: { userId, isAdmin: true } },
    },
  });
  return document;
};
