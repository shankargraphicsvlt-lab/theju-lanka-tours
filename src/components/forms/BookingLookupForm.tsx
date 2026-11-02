"use client";

import { useState } from "react";
import { z } from "zod";
import { bookingLookupSchema } from "@/lib/validation/booking-lookup";
import { Button } from "@/components/ui/Button";
import { describedBy, Field, type FieldErrors } from "./Field";

const P = "lookup-";

/**
 * Booking status requires both the reference and the email address used for
 * the booking. Lookup is not connected yet, so this only validates the format
 * and never reveals whether a reference exists.
 */
export function BookingLookupForm({ initialReference }: { initialReference: string }) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [checked, setChecked] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const parsed = bookingLookupSchema.safeParse({
      reference: String(fd.get("reference") ?? ""),
      email: String(fd.get("email") ?? "").trim(),
    });
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors);
      setChecked(false);
      return;
    }
    setErrors({});
    setChecked(true);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Field id={`${P}reference`} name="reference" label="Booking reference" errors={errors} required hint="For example TLT-ABCD-2345">
        <input
          {...describedBy(`${P}reference`, errors, "reference", true)}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          defaultValue={initialReference}
          className="field font-mono tracking-wider uppercase"
        />
      </Field>
      <Field id={`${P}email`} name="email" label="Email used for the booking" errors={errors} required>
        <input {...describedBy(`${P}email`, errors, "email")} type="email" autoComplete="email" maxLength={254} className="field" />
      </Field>
      <Button type="submit" variant="dark" size="lg" className="w-full">
        View booking status
      </Button>
      {checked && (
        <p role="status" className="border-l-4 border-gold-500 bg-gold-300/15 p-4 text-sm leading-relaxed text-charcoal-700">
          Online booking status is not available yet. Please contact us and quote your reference; we will reply to the
          email address on the booking.
        </p>
      )}
    </form>
  );
}
