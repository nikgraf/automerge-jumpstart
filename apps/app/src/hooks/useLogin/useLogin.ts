import * as opaque from "@serenity-kit/opaque";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "../../utils/trpc/trpc";

type LoginParams = {
  userIdentifier: string;
  password: string;
};

export const useLogin = () => {
  const loginStartMutation = trpc.loginStart.useMutation();
  const loginFinishMutation = trpc.loginFinish.useMutation();
  const queryClient = useQueryClient();

  return async ({ userIdentifier, password }: LoginParams) => {
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

      queryClient.invalidateQueries();

      return success ? sessionKey : null;
    } catch (error) {
      return null;
    }
  };
};
