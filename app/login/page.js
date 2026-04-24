"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col space-y-4 max-w-2xl shadow-xl p-8 border border-slate-200 rounded-lg">
        <h1 className="text-xl">
          Login
        </h1>

        <form action={formAction} className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-1">
            <label htmlFor="username">Username:</label>
            <input id="username" name="username" required className="ring-2 ring-slate-300 rounded px-2 py-1" />
          </div>
          <div className="flex flex-col space-y-1">
            <label htmlFor="username">Password:</label>
            <input id="password" type="password" name="password" required className="ring-2 ring-slate-300 rounded px-2 py-1" />
          </div>

          {state.error ? <p className="text-red-500">{state.error}</p> : null}
          <button className="bg-black text-white inline-block rounded py-2 px-4 mt-4">Login</button>
        </form>
      </div>
    </div>
  );
}