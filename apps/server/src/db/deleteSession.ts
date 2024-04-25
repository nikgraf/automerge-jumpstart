import { prisma } from "./prisma.js";

export const deleteSession = async (sessionKey: string) => {
  return prisma.session.delete({
    where: { sessionKey },
  });
};
