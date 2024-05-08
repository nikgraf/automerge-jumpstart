import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm/AuthForm";
import { useRegisterAndLogin } from "../hooks/useRegisterAndLogin/useRegisterAndLogin";

const Register = () => {
  const navigate = useNavigate();
  const registerAndLogin = useRegisterAndLogin();

  return (
    <AuthForm
      onSubmit={async ({ password, username }) => {
        await registerAndLogin({ userIdentifier: username, password });
        navigate({ to: "/" });
      }}
      children="Register"
    />
  );
};

export const Route = createLazyFileRoute("/register")({
  component: Register,
});
