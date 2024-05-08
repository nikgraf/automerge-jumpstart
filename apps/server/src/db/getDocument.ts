import { prisma } from "./prisma.js";

type Params = {
  documentId: string;
  userId: string;
};

export const getDocument = async ({ documentId, userId }: Params) => {
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      users: { some: { userId } },
    },
  });
  return document;
};
