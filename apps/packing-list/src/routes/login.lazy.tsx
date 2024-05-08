import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm/AuthForm";
import { useLogin } from "../hooks/useLogin/useLogin.js";

const Login = () => {
  const navigate = useNavigate();
  const login = useLogin();

  return (
    <AuthForm
      onSubmit={async ({ password, username }) => {
        await login({ userIdentifier: username, password });
        navigate({ to: "/" });
      }}
      children="Login"
    />
  );
};

export const Route = createLazyFileRoute("/login")({
  component: Login,
});
