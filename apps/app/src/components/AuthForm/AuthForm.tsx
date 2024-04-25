import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "../ui/input";

type Props = {
  onSubmit: (params: { username: string; password: string }) => void;
  isPending: boolean;
  children: React.ReactNode;
};

export const AuthForm = ({ onSubmit, isPending, children }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(
        e: React.FormEvent<HTMLFormElement> & {
          nativeEvent: { submitter: HTMLButtonElement };
        }
      ) => {
        e.preventDefault();
        onSubmit({ username, password });
      }}
    >
      <h1 className="text-xl text-center font-semibold mb-8 mt-12">
        {children}
      </h1>

      <div className="gap-4 flex flex-col">
        <Input
          required
          name="username"
          placeholder="Username"
          type="text"
          autoComplete="off"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />

        <Input
          required
          name="password"
          placeholder="Password"
          type="password"
          autoComplete="off"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        <Button disabled={isPending}>{children}</Button>
      </div>
    </form>
  );
};
