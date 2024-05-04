import * as opaque from "@serenity-kit/opaque";
import { request } from "../request/request";

type Params = {
  userIdentifier: string;
  password: string;
};

export async function login({ userIdentifier, password }: Params) {
  const { clientLoginState, startLoginRequest } = opaque.client.startLogin({
    password,
  });

  const { loginResponse } = await request("POST", "/login/start", {
    userIdentifier,
    startLoginRequest,
  }).then((res) => res.json());

  const loginResult = opaque.client.finishLogin({
    clientLoginState,
    loginResponse,
    password,
  });
  if (!loginResult) {
    return null;
  }
  const { sessionKey, finishLoginRequest } = loginResult;
  const res = await request("POST", "/login/finish", {
    userIdentifier,
    finishLoginRequest,
  });
  // TODO show error
  return res.ok ? sessionKey : null;
}
