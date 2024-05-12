import { prisma } from "./prisma.js";

export const getUserByUsername = async (username: string) => {
  return prisma.user.findUnique({
    where: {
      username,
    },
  });
};
