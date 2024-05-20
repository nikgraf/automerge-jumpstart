import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { AuthForm } from "../components/AuthForm/AuthForm.js";
import { useLogin } from "../hooks/useLogin/useLogin.js";
import { authenticationSearchParams } from "../schema.js";

const Login = () => {
  const navigate = useNavigate();
  const { login, isPending } = useLogin();
  const { redirect } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-md mr-auto ml-auto">
      <AuthForm
        onSubmit={async ({ password, username }) => {
          const sessionKey = await login({
            userIdentifier: username,
            password,
          });
          if (!sessionKey) {
            setError("Failed to login");
            return;
          }
          if (redirect) {
            navigate({ to: redirect });
            return;
          }
          navigate({ to: "/" });
        }}
        children="Login"
        isPending={isPending}
      />
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to log in</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: authenticationSearchParams,
});
