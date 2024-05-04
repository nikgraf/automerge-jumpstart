import { prisma } from "./prisma.js";

export const getSession = async (sessionToken: string) => {
  return prisma.session.findUnique({
    where: {
      token: sessionToken,
    },
  });
};
