import { initializeRepo } from "@/utils/automergeRepo";
import * as opaque from "@serenity-kit/opaque";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { setAuthorizationToken, trpc } from "../../utils/trpc";

type LoginParams = {
  userIdentifier: string;
  password: string;
};

export const useLogin = () => {
  const loginStartMutation = trpc.loginStart.useMutation();
  const loginFinishMutation = trpc.loginFinish.useMutation();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const login = async ({ userIdentifier, password }: LoginParams) => {
    setIsPending(true);
    try {
      const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
        password,
      });

      const { loginResponse } = await loginStartMutation.mutateAsync({
        userIdentifier,
        startLoginRequest,
      });

      const loginResult = opaque.client.finishLogin({
        clientLoginState,
        loginResponse,
        password,
      });
      if (!loginResult) {
        return null;
      }
      const { sessionKey, finishLoginRequest } = loginResult;

      const { success } = await loginFinishMutation.mutateAsync({
        finishLoginRequest,
        userIdentifier,
      });

      if (success) {
        setAuthorizationToken(sessionKey);
        initializeRepo(sessionKey); // needed since the sessionKey is part of the websocket URL
      }
      queryClient.invalidateQueries();

      return success ? sessionKey : null;
    } catch (error) {
      return null;
    } finally {
      setIsPending(false);
    }
  };
  return { isPending, login };
};
