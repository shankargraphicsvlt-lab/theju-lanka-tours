"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { siteConfig } from "@/config/site";
import { todayIso, addDays } from "@/lib/dates";
import { formatMoney } from "@/lib/format";
import { calculateTourPrice, priceEligibility, tripDaysFromDates, type Party } from "@/lib/pricing";
import { TripEstimate, type EstimateBasis } from "@/components/pricing/TripEstimate";
import {
  accommodationOptions,
  createEnquirySchema,
  enquiryInputFromFormData,
  ENQUIRY_LIMITS,
  interestOptions,
  transportOptions,
  type Enquiry,
} from "@/lib/validation/enquiry";
import { submitEnquiryAction } from "@/app/(site)/plan-your-trip/actions";
import { Button, buttonClasses } from "@/components/ui/Button";
import { DemoNotice } from "@/components/ui/Badges";
import { describedBy, ErrorSummary, Field, Honeypot, type FieldErrors } from "./Field";

export interface EnquiryDefaults {
  tour?: string;
  destinations?: string[];
  interests?: string[];
  adults?: number;
  arrivalDate?: string;
}

interface Option {
  value: string;
  label: string;
}

interface TourOption extends Option {
  durationDays: number;
}

function estimateBasis(arrival: string, departure: string, tour: string, tours: TourOption[]): EstimateBasis | null {
  const fromDates = tripDaysFromDates(arrival, departure);
  if (fromDates) return { days: fromDates, source: "dates" };
  const selected = tours.find((t) => t.value === tour);
  return selected ? { days: selected.durationDays, source: "tour" } : null;
}

function partyFrom(adults: string, children: string): Party {
  return { adults: Number(adults), children: children.trim() === "" ? 0 : Number(children) };
}

function estimateLine(basis: EstimateBasis | null, party: Party): string {
  if (!priceEligibility(party).eligible) return "Estimated tour price: custom quote required for this group.";
  if (!basis) return "";
  const price = calculateTourPrice(basis.days);
  return `Estimated tour price: ${formatMoney(price.totalCents, price.currency)} for ${basis.days} days, total for ${price.groupSize} people (${formatMoney(price.baseCents, price.currency)} less ${price.discountPercent}% discount). Inclusions and any additional costs to be confirmed.`;
}

const P = "enq-";
const labels: Record<string, string> = {
  fullName: "Full name",
  email: "Email",
  countryCode: "Country code",
  phone: "Phone",
  arrivalDate: "Arrival date",
  departureDate: "Departure date",
  adults: "Adults",
  children: "Children",
  tour: "Tour",
  specialRequests: "Special requests",
  consent: "Privacy notice",
};

const countryCodes = [
  ["+44", "United Kingdom"], ["+1", "United States / Canada"], ["+61", "Australia"], ["+64", "New Zealand"],
  ["+49", "Germany"], ["+33", "France"], ["+31", "Netherlands"], ["+41", "Switzerland"], ["+46", "Sweden"],
  ["+39", "Italy"], ["+34", "Spain"], ["+91", "India"], ["+94", "Sri Lanka"], ["+971", "United Arab Emirates"],
  ["+65", "Singapore"], ["+81", "Japan"], ["+86", "China"],
] as const;

function mailtoSummary(email: string, data: Enquiry, estimate: string): string {
  const lines = [
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.countryCode} ${data.phone}`,
    `Dates: ${data.arrivalDate} to ${data.departureDate}`,
    `Travellers: ${data.adults} adult(s), ${data.children} child(ren)`,
    `Tour: ${data.tour}`,
    data.destinations.length ? `Destinations: ${data.destinations.join(", ")}` : "",
    data.interests.length ? `Interests: ${data.interests.join(", ")}` : "",
    data.pickupLocation ? `Pickup: ${data.pickupLocation}` : "",
    `Accommodation: ${data.accommodation}; Transport: ${data.transport}`,
    estimate,
    data.specialRequests ? `\nRequests:\n${data.specialRequests}` : "",
  ].filter(Boolean);
  return `mailto:${email}?subject=${encodeURIComponent("Trip enquiry")}&body=${encodeURIComponent(lines.join("\n"))}`;
}

function StoredEnquiry({ reference, data, tourOptions }: { reference: string; data: Enquiry; tourOptions: TourOption[] }) {
  const basis = estimateBasis(data.arrivalDate, data.departureDate, data.tour, tourOptions);
  return (
    <div id="enquiry-result" tabIndex={-1} role="status" className="card p-8 outline-none sm:p-10">
      <CheckCircle2 aria-hidden className="size-8 text-forest-600" />
      <h2 className="mt-4 text-3xl text-primary">Thank you, we have received your enquiry</h2>
      <p className="mt-4 leading-relaxed text-charcoal-700">Your enquiry reference is</p>
      <p className="mt-1 font-mono text-2xl tracking-wider text-forest-900" data-testid="enquiry-reference">
        {reference}
      </p>
      <p className="mt-4 leading-relaxed text-charcoal-700">
        Please keep it for your records. <strong>An enquiry is not a confirmed booking.</strong> We will reply with
        a written quotation; your trip is confirmed only after you accept it and its terms.
      </p>
      {basis && (
        <div className="mt-6">
          <TripEstimate basis={basis} party={{ adults: data.adults, children: data.children }} />
        </div>
      )}
      <div className="mt-8">
        <Link href="/" className={buttonClasses("outline", "lg")}>
          Back to the home page
        </Link>
      </div>
    </div>
  );
}

export function EnquiryForm({
  defaults,
  tourOptions,
  destinationOptions,
  onlineEnabled = false,
}: {
  defaults: EnquiryDefaults;
  tourOptions: TourOption[];
  destinationOptions: Option[];
  /** True only when the server has online submission configured and switched on. */
  onlineEnabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);
  const idempotencyKey = useRef<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Enquiry | null>(null);
  const [stored, setStored] = useState<{ reference: string; data: Enquiry } | null>(null);
  const [basis, setBasis] = useState<EstimateBasis | null>(() =>
    estimateBasis(defaults.arrivalDate ?? "", "", defaults.tour ?? "custom", tourOptions),
  );
  const [party, setParty] = useState<Party>({ adults: defaults.adults ?? 2, children: 0 });
  const today = todayIso();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function onFormChange(event: React.FormEvent<HTMLFormElement>) {
    const fd = new FormData(event.currentTarget);
    const text = (key: string) => String(fd.get(key) ?? "");
    setBasis(estimateBasis(text("arrivalDate"), text("departureDate"), text("tour"), tourOptions));
    setParty(partyFrom(text("adults"), text("children")));
  }

  function showErrors(fieldErrors: FieldErrors) {
    setErrors(fieldErrors);
    requestAnimationFrame(() => document.getElementById("form-errors")?.focus());
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setSubmitError(null);
    const formData = new FormData(event.currentTarget);
    const parsed = createEnquirySchema(today).safeParse(enquiryInputFromFormData(formData));
    if (!parsed.success) {
      showErrors(z.flattenError(parsed.error).fieldErrors);
      setPending(false);
      return;
    }
    setErrors({});

    if (!onlineEnabled) {
      // Online submission is switched off on the server. Nothing is sent or stored.
      setResult(parsed.data);
      setPending(false);
      requestAnimationFrame(() => document.getElementById("enquiry-result")?.focus());
      return;
    }

    // One key per filled-in form: a retry or double submit returns the same reference.
    idempotencyKey.current ??= crypto.randomUUID();
    formData.set("idempotencyKey", idempotencyKey.current);
    formData.set("formStartedAt", String(startedAt.current));
    try {
      const response = await submitEnquiryAction(formData);
      if (response.status === "stored") {
        setStored({ reference: response.reference, data: parsed.data });
        requestAnimationFrame(() => document.getElementById("enquiry-result")?.focus());
      } else if (response.status === "invalid") {
        showErrors(response.fieldErrors);
      } else {
        setSubmitError(response.message);
      }
    } catch {
      setSubmitError("We could not send your enquiry. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (stored) return <StoredEnquiry reference={stored.reference} data={stored.data} tourOptions={tourOptions} />;

  if (result) {
    const email = siteConfig.contact.email;
    const resultBasis = estimateBasis(result.arrivalDate, result.departureDate, result.tour, tourOptions);
    const resultParty = { adults: result.adults, children: result.children };
    return (
      <div id="enquiry-result" tabIndex={-1} role="status" className="card p-8 outline-none sm:p-10">
        <CheckCircle2 aria-hidden className="size-8 text-forest-600" />
        <h2 className="mt-4 text-3xl text-primary">Your details look complete</h2>
        <p className="mt-4 leading-relaxed text-charcoal-700">
          <strong>Online enquiries are not active yet, so nothing has been sent or stored.</strong>{" "}
          {email
            ? "You can send these details to us by email using the button below."
            : "Contact details will be published here shortly."}
        </p>
        {resultBasis && (
          <div className="mt-6">
            <TripEstimate basis={resultBasis} party={resultParty} />
          </div>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {email && (
            <a href={mailtoSummary(email, result, estimateLine(resultBasis, resultParty))} className={buttonClasses("dark", "lg")}>
              Email these details
            </a>
          )}
          <Button variant="outline" size="lg" onClick={() => setResult(null)}>
            Edit my details
          </Button>
          <Link href="/contact" className={buttonClasses("text", "lg")}>
            Other ways to contact us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      onChange={onFormChange}
      noValidate
      className="relative space-y-10"
      aria-describedby="enquiry-note"
    >
      {onlineEnabled ? (
        <p id="enquiry-note" className="text-sm leading-relaxed text-charcoal-600">
          We reply with ideas and a written quotation. An enquiry is never a confirmed booking.
        </p>
      ) : (
        <DemoNotice>
          <span id="enquiry-note">
            Online submission is being set up. You can fill in the form to check your details, but{" "}
            <strong>nothing will be sent or stored yet</strong>. An enquiry is never a confirmed booking.
          </span>
        </DemoNotice>
      )}

      <ErrorSummary errors={errors} labels={labels} idPrefix={P} />
      <Honeypot />

      <fieldset className="space-y-6">
        <legend className="font-display text-2xl text-forest-900">About you</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`${P}fullName`} name="fullName" label="Full name" errors={errors} required className="sm:col-span-2">
            <input {...describedBy(`${P}fullName`, errors, "fullName")} type="text" autoComplete="name" required maxLength={120} className="field" />
          </Field>
          <Field id={`${P}email`} name="email" label="Email" errors={errors} required className="sm:col-span-2">
            <input {...describedBy(`${P}email`, errors, "email")} type="email" autoComplete="email" required maxLength={254} className="field" />
          </Field>
          <Field id={`${P}countryCode`} name="countryCode" label="Country code" errors={errors} required hint="For example +44">
            <input
              {...describedBy(`${P}countryCode`, errors, "countryCode", true)}
              type="text"
              inputMode="tel"
              list="country-codes"
              autoComplete="tel-country-code"
              required
              maxLength={5}
              placeholder="+44"
              className="field"
            />
          </Field>
          <datalist id="country-codes">
            {countryCodes.map(([code, country]) => (
              <option key={code} value={code}>
                {country}
              </option>
            ))}
          </datalist>
          <Field id={`${P}phone`} name="phone" label="Phone / WhatsApp" errors={errors} required>
            <input {...describedBy(`${P}phone`, errors, "phone")} type="tel" autoComplete="tel-national" required maxLength={20} className="field" />
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="font-display text-2xl text-forest-900">Your trip</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`${P}arrivalDate`} name="arrivalDate" label="Arrival date" errors={errors} required>
            <input
              {...describedBy(`${P}arrivalDate`, errors, "arrivalDate")}
              type="date"
              required
              min={today}
              max={addDays(today, ENQUIRY_LIMITS.maxDaysAhead)}
              defaultValue={defaults.arrivalDate}
              className="field"
            />
          </Field>
          <Field id={`${P}departureDate`} name="departureDate" label="Departure date" errors={errors} required>
            <input
              {...describedBy(`${P}departureDate`, errors, "departureDate")}
              type="date"
              required
              min={addDays(today, 1)}
              className="field"
            />
          </Field>
          <Field id={`${P}adults`} name="adults" label="Adults" errors={errors} required>
            <input
              {...describedBy(`${P}adults`, errors, "adults")}
              type="number"
              inputMode="numeric"
              min={1}
              max={ENQUIRY_LIMITS.maxTravellers}
              defaultValue={defaults.adults ?? 2}
              required
              className="field"
            />
          </Field>
          <Field id={`${P}children`} name="children" label="Children (under 12)" errors={errors}>
            <input
              {...describedBy(`${P}children`, errors, "children")}
              type="number"
              inputMode="numeric"
              min={0}
              max={ENQUIRY_LIMITS.maxTravellers}
              defaultValue={0}
              className="field"
            />
          </Field>
          <Field id={`${P}tour`} name="tour" label="Tour" errors={errors} required className="sm:col-span-2">
            <select {...describedBy(`${P}tour`, errors, "tour")} defaultValue={defaults.tour ?? "custom"} className="field">
              <option value="custom">A custom journey designed for me</option>
              {tourOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-forest-900">
            Places you would like to include <span className="font-normal text-charcoal-500">(optional)</span>
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {destinationOptions.map((o) => (
              <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-ivory-300 bg-cream px-4 text-sm has-[:checked]:border-forest-700 has-[:checked]:bg-forest-700/5">
                <input
                  type="checkbox"
                  name="destinations"
                  value={o.value}
                  defaultChecked={defaults.destinations?.includes(o.value)}
                  className="size-4 accent-forest-700"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-medium text-forest-900">
            Interests <span className="font-normal text-charcoal-500">(optional)</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {interestOptions.map((o) => (
              <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ivory-300 bg-cream px-4 text-sm has-[:checked]:border-forest-700 has-[:checked]:bg-forest-700 has-[:checked]:text-ivory-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-500">
                <input
                  type="checkbox"
                  name="interests"
                  value={o.value}
                  defaultChecked={defaults.interests?.includes(o.value)}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>
      </fieldset>

      <TripEstimate basis={basis} party={party} />

      <fieldset className="space-y-6">
        <legend className="font-display text-2xl text-forest-900">Preferences</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id={`${P}pickupLocation`} name="pickupLocation" label="Pickup location" errors={errors} hint="For example the airport, or your hotel in Colombo" className="sm:col-span-2">
            <input {...describedBy(`${P}pickupLocation`, errors, "pickupLocation", true)} type="text" maxLength={200} className="field" />
          </Field>
          <Field id={`${P}accommodation`} name="accommodation" label="Accommodation style" errors={errors}>
            <select {...describedBy(`${P}accommodation`, errors, "accommodation")} defaultValue="no-preference" className="field">
              {accommodationOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${P}transport`} name="transport" label="Transport" errors={errors}>
            <select {...describedBy(`${P}transport`, errors, "transport")} defaultValue="no-preference" className="field">
              {transportOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field id={`${P}specialRequests`} name="specialRequests" label="Special requests" errors={errors} hint="Dietary needs, mobility, celebrations, anything we should know" className="sm:col-span-2">
            <textarea
              {...describedBy(`${P}specialRequests`, errors, "specialRequests", true)}
              rows={5}
              maxLength={ENQUIRY_LIMITS.maxRequestLength}
              className="field"
            />
          </Field>
        </div>
      </fieldset>

      <div className="space-y-2">
        <label className="flex cursor-pointer gap-3 text-sm leading-relaxed text-charcoal-700">
          <input
            {...describedBy(`${P}consent`, errors, "consent")}
            type="checkbox"
            required
            className="mt-1 size-4 shrink-0 accent-forest-700"
          />
          <span>
            I have read the{" "}
            <Link href="/privacy" className="text-forest-800 underline underline-offset-2">
              privacy notice
            </Link>{" "}
            and agree that {siteConfig.name} may use these details to respond to my enquiry.
          </span>
        </label>
        {errors.consent?.[0] && (
          <p id={`${P}consent-error`} className="text-sm text-[#a8322d]">
            {errors.consent[0]}
          </p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="border-l-2 border-[#a8322d] bg-[#a8322d]/5 px-4 py-3 text-sm text-[#a8322d]">
          {submitError}
        </p>
      )}

      <Button type="submit" variant="dark" size="lg" disabled={pending} className="w-full sm:w-auto">
        {onlineEnabled ? (pending ? "Sending…" : "Send enquiry") : pending ? "Checking…" : "Check my enquiry"}
      </Button>
    </form>
  );
}
