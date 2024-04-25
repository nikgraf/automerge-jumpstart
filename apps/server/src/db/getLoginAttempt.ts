import { prisma } from "./prisma.js";

export const getLoginAttempt = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      loginAttempt: {
        where: {
          createdAt: {
            // less than 8 seconds ago
            gte: new Date(Date.now() - 8000),
          },
        },
      },
    },
  });
  return user?.loginAttempt || null;
};
