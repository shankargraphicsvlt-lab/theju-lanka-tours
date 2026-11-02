import { createHash } from "node:crypto";
import { z } from "zod";
import { createEnquirySchema, enquiryInputFromFormData } from "@/lib/validation/enquiry";

/**
 * Booking-enquiry submission, independent of Next.js and Supabase so it can be
 * tested with a fake store. The server action wires it to the real database.
 *
 * Order matters: the rate limit is consumed before validation so that every
 * attempt counts, including invalid ones.
 */

export const PRIVACY_NOTICE_VERSION = "2026-10-draft";

export const SUBMISSION_LIMITS = {
  /** Attempts per hashed IP per window. */
  maxAttemptsPerIp: 10,
  windowSeconds: 3600,
  /** Faster than this is treated as automated. */
  minFillMs: 3000,
} as const;

export type CreateEnquiryResult =
  | { ok: true; reference: string; duplicate: boolean }
  | { ok: false; error: string };

export interface EnquiryStore {
  consumeRateLimit(bucket: string, maxHits: number, windowSeconds: number): Promise<boolean>;
  /** Throws an Error whose message is the database error code on rejection. */
  createEnquiry(payload: Record<string, unknown>, submitterHash: string): Promise<CreateEnquiryResult>;
}

export type FieldErrors = Partial<Record<string, string[]>>;

export type SubmitEnquiryResult =
  | { status: "stored"; reference: string; duplicate: boolean }
  | { status: "invalid"; fieldErrors: FieldErrors }
  | { status: "error"; message: string };

export interface SubmitContext {
  ip: string | null;
  hashSalt: string;
  today: string;
  now: number;
}

const GENERIC_ERROR = "We could not send your enquiry. Please try again, or contact us directly.";

/** Database error codes (see supabase/migrations/*_functions.sql) → what the visitor sees. */
const DB_ERRORS: Record<string, { field?: string; message: string }> = {
  consent_required: { field: "consent", message: "Please confirm you have read the privacy notice" },
  invalid_dates: { field: "arrivalDate", message: "Please enter valid dates" },
  arrival_in_past: { field: "arrivalDate", message: "Arrival date cannot be in the past" },
  arrival_too_far_ahead: { field: "arrivalDate", message: "We can plan up to two years ahead" },
  departure_not_after_arrival: { field: "departureDate", message: "Departure must be after arrival" },
  trip_too_long: { field: "departureDate", message: "Trips longer than 60 nights: please contact us directly" },
  unknown_tour: { field: "tour", message: "Please choose a tour from the list" },
  unknown_destination: { message: "One of the selected places is no longer available. Please review your choices." },
  unknown_interest: { message: "One of the selected interests is not recognised. Please review your choices." },
  invalid_travellers: { field: "adults", message: "Please check the number of travellers" },
  too_many_requests: {
    message: "We have received several enquiries from this email address today. Please contact us directly.",
  },
};

export function hashWithSalt(value: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

/** Maps a database error code to a result. Unknown codes are never shown to the visitor. */
export function resultForDbError(code: string): SubmitEnquiryResult {
  const known = Object.entries(DB_ERRORS).find(([key]) => code === key || code.startsWith(`${key}:`))?.[1];
  if (!known) return { status: "error", message: GENERIC_ERROR };
  return known.field
    ? { status: "invalid", fieldErrors: { [known.field]: [known.message] } }
    : { status: "error", message: known.message };
}

export async function submitEnquiry(
  formData: FormData,
  store: EnquiryStore,
  ctx: SubmitContext,
): Promise<SubmitEnquiryResult> {
  const submitterHash = hashWithSalt(ctx.ip ?? "unknown", ctx.hashSalt);

  try {
    const allowed = await store.consumeRateLimit(
      `booking:ip:${submitterHash}`,
      SUBMISSION_LIMITS.maxAttemptsPerIp,
      SUBMISSION_LIMITS.windowSeconds,
    );
    if (!allowed) {
      return { status: "error", message: "Too many attempts. Please wait a while and try again, or contact us directly." };
    }
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }

  // Bot checks. Real visitors never see the honeypot and take longer than a few seconds.
  const startedRaw = formData.get("formStartedAt");
  const startedAt = typeof startedRaw === "string" && /^\d{1,16}$/.test(startedRaw) ? Number(startedRaw) : NaN;
  const website = formData.get("website");
  if ((typeof website === "string" && website !== "") || !Number.isFinite(startedAt) || ctx.now - startedAt < SUBMISSION_LIMITS.minFillMs) {
    return { status: "error", message: GENERIC_ERROR };
  }

  const idempotencyKey = z.uuid().safeParse(formData.get("idempotencyKey"));
  if (!idempotencyKey.success) return { status: "error", message: GENERIC_ERROR };

  const parsed = createEnquirySchema(ctx.today).safeParse(enquiryInputFromFormData(formData));
  if (!parsed.success) {
    return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // The honeypot is dropped; prices are never sent (the database calculates its own estimate).
  const { website: _honeypot, ...enquiry } = parsed.data;
  void _honeypot;
  const payload = {
    ...enquiry,
    idempotencyKey: idempotencyKey.data,
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
  };

  try {
    const result = await store.createEnquiry(payload, submitterHash);
    if (result.ok) return { status: "stored", reference: result.reference, duplicate: result.duplicate };
    return resultForDbError(result.error);
  } catch (error) {
    return resultForDbError(error instanceof Error ? error.message : "");
  }
}
