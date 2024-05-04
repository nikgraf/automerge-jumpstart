import type { Response } from "express";

export const sendError = (res: Response, status: number, error: string) => {
  res.writeHead(status);
  res.end(JSON.stringify({ error }));
};
