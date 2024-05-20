import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { AuthForm } from "../components/AuthForm/AuthForm";
import { useRegisterAndLogin } from "../hooks/useRegisterAndLogin/useRegisterAndLogin";
import { authenticationSearchParams } from "../schema";

const Register = () => {
  const navigate = useNavigate();
  const { registerAndLogin, isPending } = useRegisterAndLogin();
  const { redirect } = Route.useSearch();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-md mr-auto ml-auto">
      <AuthForm
        onSubmit={async ({ password, username }) => {
          const sessionKey = await registerAndLogin({
            userIdentifier: username,
            password,
          });
          if (!sessionKey) {
            setError("Failed to register");
            return;
          }
          if (redirect) {
            navigate({ to: redirect });
            return;
          }
          navigate({ to: "/" });
        }}
        children="Register"
        isPending={isPending}
      />
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to register</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const Route = createFileRoute("/register")({
  component: Register,
  validateSearch: authenticationSearchParams,
});
