const { randomBytes } = await import("node:crypto");

export const generateId = (length = 16) => {
  return randomBytes(length).toString("base64url");
};
