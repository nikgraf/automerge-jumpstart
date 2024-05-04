import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm/AuthForm";
import { registerAndLogin } from "../utils/registerAndLogin/registerAndLogin";

const Register = () => {
  const navigate = useNavigate();
  return (
    <AuthForm
      onSubmit={async ({ password, username }) => {
        await registerAndLogin({ userIdentifier: username, password });
        // TODO login after registration
        navigate({ to: "/" });
      }}
      children="Register"
    />
  );
};

export const Route = createLazyFileRoute("/register")({
  component: Register,
});
