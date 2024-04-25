import { prisma } from "./prisma.js";

export const getSession = async (sessionKey: string) => {
  return prisma.session.findUnique({
    where: { sessionKey },
  });
};
