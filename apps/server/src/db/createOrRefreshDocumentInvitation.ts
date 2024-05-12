import { generateId } from "../utils/generateId/generateId.js";
import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentId: string;
};

export const createOrRefreshDocumentInvitation = async ({
  userId,
  documentId,
}: Params) => {
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      users: { some: { userId, isAdmin: true } },
    },
  });
  if (!document) {
    throw new Error("Document not found or user is not an admin");
  }

  await prisma.documentInvitation.deleteMany({
    where: { documentId },
  });

  const token = generateId();

  return prisma.documentInvitation.create({
    data: {
      token,
      documentId,
    },
  });
};
