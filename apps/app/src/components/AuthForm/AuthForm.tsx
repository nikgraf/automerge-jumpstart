import { useState } from "react";

type Props = {
  onSubmit: (params: { username: string; password: string }) => void;
  children: React.ReactNode;
};

export const AuthForm = ({ onSubmit, children }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <form
        id="form"
        className="p-12 space-y-4 max-w-xl"
        onSubmit={(
          e: React.FormEvent<HTMLFormElement> & {
            nativeEvent: { submitter: HTMLButtonElement };
          }
        ) => {
          e.preventDefault();
          onSubmit({ username, password });
        }}
      >
        <h1 className="text-xl font-semibold">Login/Register</h1>

        <div className="space-y-2 flex flex-col">
          <input
            required
            className="border border-slate-300 p-2 rounded"
            name="username"
            placeholder="Username"
            type="text"
            autoComplete="off"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />

          <input
            required
            className="border border-slate-300 p-2 rounded"
            name="password"
            placeholder="Password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <div className="space-x-2">
            <button>{children}</button>
          </div>
        </div>
      </form>
    </>
  );
};
