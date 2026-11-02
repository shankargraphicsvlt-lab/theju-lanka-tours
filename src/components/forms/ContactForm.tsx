"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { z } from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { siteConfig, whatsappGreeting, whatsappHref } from "@/config/site";
import { submitContactAction } from "@/app/(site)/contact/actions";
import { contactSchema } from "@/lib/validation/contact";
import { Button } from "@/components/ui/Button";
import { describedBy, ErrorSummary, Field, Honeypot, type FieldErrors } from "./Field";

const P = "contact-";
const labels: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  subject: "Subject",
  message: "Message",
  consent: "Privacy notice",
};

/** Shown when sending fails: the WhatsApp number always works. */
function SendError({ reason }: { reason: "unavailable" | "rate_limited" | "failed" }) {
  const wa = whatsappHref(whatsappGreeting);
  return (
    <div role="alert" className="flex gap-3 rounded-2xl border border-[#a8322d]/30 bg-white p-4 text-sm leading-relaxed text-charcoal-800">
      <AlertCircle aria-hidden className="mt-0.5 size-5 shrink-0 text-[#a8322d]" />
      <p>
        {reason === "rate_limited"
          ? "You have sent several messages recently, so we could not send this one."
          : "Sorry, your message could not be sent."}{" "}
        Please message us on WhatsApp instead:{" "}
        {wa ? (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline underline-offset-2">
            {siteConfig.contact.whatsappDisplay}
          </a>
        ) : (
          <strong>{siteConfig.contact.whatsappDisplay}</strong>
        )}
        .
      </p>
    </div>
  );
}

export function ContactForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [sendError, setSendError] = useState<"unavailable" | "rate_limited" | "failed" | null>(null);
  // One key per message, so a double submit is stored once.
  const idempotencyKey = useRef<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const parsed = contactSchema.safeParse({
      fullName: fd.get("fullName") ?? "",
      email: String(fd.get("email") ?? "").trim(),
      subject: fd.get("subject") ?? "",
      message: fd.get("message") ?? "",
      consent: fd.get("consent") === "on",
      website: "",
    });
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
      return;
    }
    setErrors({});
    setSendError(null);
    setState("sending");
    idempotencyKey.current ??= crypto.randomUUID();
    fd.set("idempotencyKey", idempotencyKey.current);
    const result = await submitContactAction(fd).catch(() => ({ status: "error" as const, reason: "failed" as const }));
    if (result.status === "sent") {
      idempotencyKey.current = null;
      form.reset();
      setState("sent");
      return;
    }
    setState("idle");
    if (result.status === "invalid") {
      setErrors(result.fieldErrors);
      requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
    } else {
      setSendError(result.reason);
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="card p-8">
        <CheckCircle2 aria-hidden className="size-8 text-green" />
        <h2 className="mt-4 text-3xl text-primary">Thank you, your message has been sent</h2>
        <p className="mt-3 leading-relaxed text-charcoal-700">
          We will reply to your email as soon as we can. For anything urgent, message us on WhatsApp at{" "}
          {siteConfig.contact.whatsappDisplay}.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setState("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-6" aria-busy={state === "sending"}>
      <ErrorSummary errors={errors} labels={labels} idPrefix={P} />
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id={`${P}fullName`} name="fullName" label="Full name" errors={errors} required>
          <input {...describedBy(`${P}fullName`, errors, "fullName")} type="text" autoComplete="name" maxLength={120} className="field" />
        </Field>
        <Field id={`${P}email`} name="email" label="Email" errors={errors} required>
          <input {...describedBy(`${P}email`, errors, "email")} type="email" autoComplete="email" maxLength={254} className="field" />
        </Field>
      </div>
      <Field id={`${P}subject`} name="subject" label="Subject" errors={errors} required>
        <input {...describedBy(`${P}subject`, errors, "subject")} type="text" maxLength={150} className="field" />
      </Field>
      <Field id={`${P}message`} name="message" label="Message" errors={errors} required>
        <textarea {...describedBy(`${P}message`, errors, "message")} rows={6} maxLength={3000} className="field" />
      </Field>
      <div className="space-y-2">
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-charcoal-700">
          <input {...describedBy(`${P}consent`, errors, "consent")} type="checkbox" className="mt-1 size-4 shrink-0 accent-forest-700" />
          <span>
            I have read the{" "}
            <Link href="/privacy" className="text-forest-800 underline underline-offset-2">
              privacy notice
            </Link>
            .
          </span>
        </label>
        {errors.consent?.[0] && (
          <p id={`${P}consent-error`} className="text-sm text-[#a8322d]">
            {errors.consent[0]}
          </p>
        )}
      </div>
      {sendError && <SendError reason={sendError} />}
      <Button type="submit" size="lg" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
