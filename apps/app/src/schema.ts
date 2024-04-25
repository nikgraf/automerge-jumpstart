import { z } from "zod";

export const authenticationSearchParams = z.object({
  redirect: z.string().optional(),
});
