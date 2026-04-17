"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div>
      <h1 className="text-3xl">
        Login
      </h1>

      <form action={formAction}>
        Username:
        <input name="username" required className="ring-2 ring-slate-300 rounded" />
        <br />
        Password:
        <input type="password" name="password" required className="ring-2 ring-slate-300 rounded" />

        {state.error ? <p className="text-red-500">{state.error}</p> : null}

        <br />
        <button className="bg-black text-white inline-block rounded py-2 px-4">Login</button>
      </form>
    </div>
  );
}