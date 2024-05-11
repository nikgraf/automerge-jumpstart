import * as opaque from "@serenity-kit/opaque";
import { trpc } from "../../utils/trpc/trpc";
import { useLogin } from "../useLogin/useLogin";

type RegisterParams = {
  userIdentifier: string;
  password: string;
};

export const useRegisterAndLogin = () => {
  const registerStartMutation = trpc.registerStart.useMutation();
  const registerFinishMutation = trpc.registerFinish.useMutation();
  const login = useLogin();

  return async ({ userIdentifier, password }: RegisterParams) => {
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

      return login({ userIdentifier, password });
    } catch (error) {
      return null;
    }
  };
};
