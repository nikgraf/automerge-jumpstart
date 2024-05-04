import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentId: string;
};

export const createDocument = async ({ userId, documentId }: Params) => {
  return prisma.document.create({
    data: {
      id: documentId,
      name: "Untitled",
      ownerId: userId,
    },
  });
};
