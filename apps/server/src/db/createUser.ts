import { prisma } from "./prisma.js";

type Params = {
  username: string;
  registrationRecord: string;
};

export const createUser = async (user: Params) => {
  return prisma.user.create({
    data: {
      username: user.username,
      registrationRecord: user.registrationRecord,
    },
  });
};
