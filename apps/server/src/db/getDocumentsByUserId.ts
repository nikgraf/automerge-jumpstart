import { prisma } from "./prisma.js";

export const getDocumentsByUserId = async (userId: string) => {
  return prisma.document.findMany({
    where: {
      users: { some: { userId } },
    },
  });
};
