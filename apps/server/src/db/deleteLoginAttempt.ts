import { prisma } from "./prisma.js";

export const deleteLoginAttempt = async (userId: string) => {
  return prisma.loginAttempt.delete({
    where: {
      userId,
    },
  });
};
