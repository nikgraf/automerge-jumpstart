import { prisma } from "./prisma.js";

type Params = {
  sessionKey: string;
  userId: string;
};

export const createSession = async ({ sessionKey, userId }: Params) => {
  return prisma.session.create({
    data: {
      sessionKey,
      userId,
    },
  });
};
