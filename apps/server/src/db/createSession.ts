import { prisma } from "./prisma.js";

type Params = {
  token: string;
  sessionKey: string;
  userId: string;
};

export const createSession = async ({ token, sessionKey, userId }: Params) => {
  return prisma.session.create({
    data: {
      token,
      sessionKey,
      userId,
    },
  });
};
