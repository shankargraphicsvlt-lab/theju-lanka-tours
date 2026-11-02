"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { subscribeAction } from "@/app/(site)/newsletter/actions";
import type { SubscribeResult } from "@/lib/newsletter/subscribe";
import { buttonClasses } from "@/components/ui/Button";
import { Honeypot } from "@/components/forms/Field";

const messages: Record<Exclude<SubscribeResult["status"], "subscribed" | "invalid">, string> = {
  already: "You're already on our list. Thank you!",
  error: "Sorry, we could not sign you up just now. Please try again later.",
};

/** Email sign-up: saved to the newsletter list, with a honeypot against bots. */
export function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [result, setResult] = useState<SubscribeResult | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setState("sending");
    const r = await subscribeAction(new FormData(form)).catch((): SubscribeResult => ({ status: "error", reason: "failed" }));
    setState("idle");
    setResult(r);
    if (r.status === "subscribed") form.reset();
  }

  if (result?.status === "subscribed") {
    return (
      <p role="status" className="flex items-center gap-2 font-semibold text-primary lg:max-w-md">
        <CheckCircle2 aria-hidden className="size-5 text-green" /> Thanks, you&apos;re subscribed.
      </p>
    );
  }

  const note = !result ? null : result.status === "invalid" ? result.message : messages[result.status];
  return (
    <form onSubmit={onSubmit} noValidate className="relative w-full lg:max-w-md" aria-busy={state === "sending"}>
      <Honeypot id="newsletter-website" />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={254}
          placeholder="Your email address"
          aria-describedby={note ? "newsletter-status" : undefined}
          aria-invalid={result?.status === "invalid" || undefined}
          className="field flex-1"
        />
        <button type="submit" disabled={state === "sending"} className={buttonClasses("primary", "md", "py-3")}>
          {state === "sending" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      {note && (
        <p id="newsletter-status" role={result?.status === "already" ? "status" : "alert"} className="mt-2 text-sm text-charcoal-700">
          {note}
        </p>
      )}
    </form>
  );
}
