import { prisma } from "./prisma.js";

export const deleteSession = async (sessionToken: string) => {
  return prisma.session.delete({
    where: {
      token: sessionToken,
    },
  });
};
