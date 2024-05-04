import * as opaque from "@serenity-kit/opaque";
import { login } from "../login/login";
import { request } from "../request/request";

type Params = {
  userIdentifier: string;
  password: string;
};

export async function registerAndLogin({ userIdentifier, password }: Params) {
  const { clientRegistrationState, registrationRequest } =
    opaque.client.startRegistration({ password });
  const { registrationResponse } = await request("POST", `/register/start`, {
    userIdentifier,
    registrationRequest,
  }).then((res) => res.json());

  const { registrationRecord } = opaque.client.finishRegistration({
    clientRegistrationState,
    registrationResponse,
    password,
  });

  const res = await request("POST", `/register/finish`, {
    userIdentifier,
    registrationRecord,
  });

  if (!res.ok) {
    throw new Error("Failed to register");
  }

  return login({ userIdentifier, password });
}
