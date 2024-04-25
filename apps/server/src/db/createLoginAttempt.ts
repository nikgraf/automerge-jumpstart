import { prisma } from "./prisma.js";

type Params = {
  userId: string;
  serverLoginState: string;
};

export const createLoginAttempt = async ({
  userId,
  serverLoginState,
}: Params) => {
  return prisma.loginAttempt.create({
    data: {
      userId,
      serverLoginState,
    },
  });
};
