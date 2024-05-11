import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm/AuthForm.js";
import { useLogin } from "../hooks/useLogin/useLogin.js";
import { authenticationSearchParams } from "../schema.js";

const Login = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const { redirect } = Route.useSearch();

  return (
    <AuthForm
      onSubmit={async ({ password, username }) => {
        await login({ userIdentifier: username, password });
        if (redirect) {
          navigate({ to: redirect });
          return;
        }
        navigate({ to: "/" });
      }}
      children="Login"
    />
  );
};

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: authenticationSearchParams,
});
