import { prisma } from "./prisma.js";

type Params = {
  documentId: string;
  userId: string;
};

export const getDocumentMembers = async ({ documentId, userId }: Params) => {
  const document = await prisma.document.findUnique({
    where: {
      id: documentId,
      users: { some: { userId } },
    },
    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!document) return null;

  const users = document.users.map((connection) => {
    return {
      id: connection.userId,
      isAdmin: connection.isAdmin,
      username: connection.user.username,
    };
  });

  return users;
};
