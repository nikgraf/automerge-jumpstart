import { prisma } from "./prisma.js";

export const getUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};
