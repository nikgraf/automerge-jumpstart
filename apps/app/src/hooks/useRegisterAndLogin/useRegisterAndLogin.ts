import * as opaque from "@serenity-kit/opaque";
import { useState } from "react";
import { trpc } from "../../utils/trpc/trpc";
import { useLogin } from "../useLogin/useLogin";

type RegisterParams = {
  userIdentifier: string;
  password: string;
};

export const useRegisterAndLogin = () => {
  const [isPending, setIsPending] = useState(false);
  const registerStartMutation = trpc.registerStart.useMutation();
  const registerFinishMutation = trpc.registerFinish.useMutation();
  const { login } = useLogin();

  const registerAndLogin = async ({
    userIdentifier,
    password,
  }: RegisterParams) => {
    setIsPending(true);
    try {
      const { clientRegistrationState, registrationRequest } =
        opaque.client.startRegistration({ password });
      const { registrationResponse } = await registerStartMutation.mutateAsync({
        userIdentifier,
        registrationRequest,
      });

      const { registrationRecord } = opaque.client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
      });

      await registerFinishMutation.mutateAsync({
        userIdentifier,
        registrationRecord,
      });

      const result = await login({ userIdentifier, password });
      return result;
    } catch (error) {
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { isPending, registerAndLogin };
};
