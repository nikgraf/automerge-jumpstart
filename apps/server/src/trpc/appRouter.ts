import * as opaque from "@serenity-kit/opaque";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { repo } from "../automergeRepo/automergeRepo.js";
import { addUserToDocument } from "../db/addUserToDocument.js";
import { createDocument } from "../db/createDocument.js";
import { createLoginAttempt } from "../db/createLoginAttempt.js";
import { createOrRefreshDocumentInvitation } from "../db/createOrRefreshDocumentInvitation.js";
import { createSession } from "../db/createSession.js";
import { createUser } from "../db/createUser.js";
import { deleteLoginAttempt } from "../db/deleteLoginAttempt.js";
import { deleteSession } from "../db/deleteSession.js";
import { getDocument } from "../db/getDocument.js";
import { getDocumentInvitation } from "../db/getDocumentInvitation.js";
import { getDocumentMembers } from "../db/getDocumentMembers.js";
import { getDocumentsByUserId } from "../db/getDocumentsByUserId.js";
import { getLoginAttempt } from "../db/getLoginAttempt.js";
import { getUser } from "../db/getUser.js";
import { getUserByUsername } from "../db/getUserByUsername.js";
import { updateDocument } from "../db/updateDocument.js";
import {
  LoginFinishParams,
  LoginStartParams,
  RegisterFinishParams,
  RegisterStartParams,
} from "../schema.js";
import { getOpaqueServerSetup } from "../utils/getOpaqueServerSetup.js";
import { protectedProcedure, publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  me: protectedProcedure.query(async (opts) => {
    const user = await getUser(opts.ctx.session.userId);
    if (!user) return null;
    return { id: user.id, username: user.username };
  }),
  documents: protectedProcedure.query(async (opts) => {
    const documents = await getDocumentsByUserId(opts.ctx.session.userId);
    return documents.map((doc) => ({ id: doc.id, name: doc.name }));
  }),
  getDocument: protectedProcedure.input(z.string()).query(async (opts) => {
    const document = await getDocument({
      documentId: opts.input,
      userId: opts.ctx.session.userId,
    });
    if (!document) return null;
    return {
      id: document.id,
      name: document.name,
      isAdmin: document.users.length > 0 ? document.users[0].isAdmin : false,
    };
  }),
  updateDocument: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .mutation(async (opts) => {
      const updatedDocument = await updateDocument({
        documentId: opts.input.id,
        userId: opts.ctx.session.userId,
        name: opts.input.name,
      });
      return { id: updatedDocument.id, name: updatedDocument.name };
    }),
  createDocument: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async (opts) => {
      const { documentId } = repo.create();
      const document = await createDocument({
        userId: opts.ctx.session.userId,
        documentId,
        name: opts.input.name,
      });
      return { document: { id: document.id, name: document.name } };
    }),

  createOrRefreshDocumentInvitation: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
      })
    )
    .mutation(async (opts) => {
      const documentInvitation = await createOrRefreshDocumentInvitation({
        userId: opts.ctx.session.userId,
        documentId: opts.input.documentId,
      });
      return documentInvitation ? { token: documentInvitation.token } : null;
    }),

  documentInvitation: protectedProcedure
    .input(z.string())
    .query(async (opts) => {
      const documentInvitation = await getDocumentInvitation({
        documentId: opts.input,
        userId: opts.ctx.session.userId,
      });
      if (!documentInvitation) return null;
      return { token: documentInvitation.token };
    }),

  acceptDocumentInvitation: protectedProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async (opts) => {
      const result = await addUserToDocument({
        userId: opts.ctx.session.userId,
        documentInvitationToken: opts.input.token,
      });
      return result ? { documentId: result.documentId } : null;
    }),

  documentMembers: protectedProcedure.input(z.string()).query(async (opts) => {
    const members = await getDocumentMembers({
      documentId: opts.input,
      userId: opts.ctx.session.userId,
    });
    return members;
  }),

  logout: protectedProcedure.mutation(async (opts) => {
    await deleteSession(opts.ctx.session.sessionKey);
  }),

  registerStart: publicProcedure
    .input(RegisterStartParams)
    .mutation(async (opts) => {
      const { userIdentifier, registrationRequest } = opts.input;

      const user = await getUserByUsername(userIdentifier);
      if (user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "user already registered",
        });
      }

      const { registrationResponse } = opaque.server.createRegistrationResponse(
        {
          serverSetup: getOpaqueServerSetup(),
          userIdentifier,
          registrationRequest,
        }
      );

      return { registrationResponse };
    }),

  registerFinish: publicProcedure
    .input(RegisterFinishParams)
    .mutation(async (opts) => {
      const { userIdentifier, registrationRecord } = opts.input;

      const existingUser = await getUserByUsername(userIdentifier);
      if (!existingUser) {
        await createUser({ username: userIdentifier, registrationRecord });
      }

      // return always the same result even if the user already exists to
      // avoid leaking the information if the user exists or not
      return;
    }),

  loginStart: publicProcedure.input(LoginStartParams).mutation(async (opts) => {
    const { userIdentifier, startLoginRequest } = opts.input;

    const user = await getUserByUsername(userIdentifier);
    if (!user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "user not registered",
      });
    const { registrationRecord, id: userId } = user;

    const loginAttempt = await getLoginAttempt(userIdentifier);
    if (loginAttempt) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "login already started",
      });
    }

    const { serverLoginState, loginResponse } = opaque.server.startLogin({
      serverSetup: getOpaqueServerSetup(),
      userIdentifier,
      registrationRecord,
      startLoginRequest,
    });

    await createLoginAttempt({ userId, serverLoginState });

    return { loginResponse };
  }),
  loginFinish: publicProcedure
    .input(LoginFinishParams)
    .mutation(async (opts) => {
      const { userIdentifier, finishLoginRequest } = opts.input;

      const loginAttempt = await getLoginAttempt(userIdentifier);
      if (!loginAttempt || !loginAttempt.serverLoginState)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "login not started",
        });
      const { serverLoginState } = loginAttempt;
      const { sessionKey } = opaque.server.finishLogin({
        finishLoginRequest,
        serverLoginState,
      });

      const user = await getUserByUsername(userIdentifier);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "user not found",
        });
      }
      await createSession({ sessionKey, userId: user.id });
      await deleteLoginAttempt(user.id);

      return { success: true };
    }),
});

export type AppRouter = typeof appRouter;
