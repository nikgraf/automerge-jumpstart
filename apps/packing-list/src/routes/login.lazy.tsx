import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm/AuthForm";
import { login } from "../utils/login/login";

const Login = () => {
  const navigate = useNavigate();

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
