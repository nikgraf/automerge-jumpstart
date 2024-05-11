import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthForm } from "../components/AuthForm/AuthForm";
import { useRegisterAndLogin } from "../hooks/useRegisterAndLogin/useRegisterAndLogin";
import { authenticationSearchParams } from "../schema";

const Register = () => {
  const navigate = useNavigate();
  const registerAndLogin = useRegisterAndLogin();
  const { redirect } = Route.useSearch();

  return (
    <AuthForm
      onSubmit={async ({ password, username }) => {
        await registerAndLogin({ userIdentifier: username, password });
        if (redirect) {
          navigate({ to: redirect });
          return;
        }
        navigate({ to: "/" });
      }}
      children="Register"
    />
  );
};

export const Route = createFileRoute("/register")({
  component: Register,
  validateSearch: authenticationSearchParams,
});
