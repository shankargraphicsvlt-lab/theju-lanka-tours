"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "../actions";
import { Button } from "@/components/ui/Button";

const initial: SignInState = { error: null };

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initial);
  return (
    <form action={action} className="mt-8 space-y-5">
      {state.error && (
        <p role="alert" className="border-l-2 border-[#a8322d] bg-[#a8322d]/5 px-4 py-3 text-sm text-[#a8322d]">
          {state.error}
        </p>
      )}
      <div className="space-y-2">
        <label htmlFor="admin-email" className="block text-sm font-medium text-forest-900">
          Email
        </label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} className="field" />
      </div>
      <div className="space-y-2">
        <label htmlFor="admin-password" className="block text-sm font-medium text-forest-900">
          Password
        </label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required maxLength={200} className="field" />
      </div>
      <Button type="submit" variant="dark" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
