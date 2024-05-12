import { generateId } from "../utils/generateId/generateId.js";
import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  documentId: string;
  name?: string;
};

export const createDocument = async ({ userId, documentId, name }: Params) => {
  return prisma.document.create({
    data: {
      id: documentId,
      name: name || "Untitled",
      users: {
        create: {
          userId,
          isAdmin: true,
        },
      },
      documentInvitations: {
        create: {
          token: generateId(16),
        },
      },
    },
  });
};
