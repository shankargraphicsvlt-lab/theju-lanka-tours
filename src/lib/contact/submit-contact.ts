import { z } from "zod";
import { hashWithSalt, PRIVACY_NOTICE_VERSION } from "@/lib/booking/submit-enquiry";
import { contactSchema } from "@/lib/validation/contact";

/**
 * Contact-form submission, independent of Next.js, Resend and Supabase so it
 * can be tested with fakes. The message is emailed to the business and, when
 * storage is on, also saved to public.contact_enquiries as a backup. It counts
 * as sent when either succeeds.
 */

export const CONTACT_LIMITS = { maxAttemptsPerIp: 5, windowSeconds: 3600 } as const;

export interface ContactStore {
  consumeRateLimit(bucket: string, maxHits: number, windowSeconds: number): Promise<boolean>;
  /** Saves the message; `error: "too_many_requests"` when this email has sent several today. */
  createContactEnquiry(payload: Record<string, unknown>, submitterHash: string | null): Promise<{ ok: boolean; error?: string }>;
}

export interface ContactDeps {
  store: ContactStore | null;
  /** Emails the message to the business; resolves false on failure. Null when email is not configured. */
  sendEmail: ((message: { subject: string; text: string; replyTo: string }) => Promise<boolean>) | null;
}

export type SubmitContactResult =
  | { status: "sent" }
  | { status: "invalid"; fieldErrors: Partial<Record<string, string[]>> }
  | { status: "error"; reason: "unavailable" | "rate_limited" | "failed" };

const uuid = z.uuid();

export async function submitContact(
  formData: FormData,
  deps: ContactDeps,
  ctx: { ip: string | null; hashSalt: string | null },
): Promise<SubmitContactResult> {
  // Honeypot: bots fill the hidden field. Pretend it worked and do nothing.
  if (String(formData.get("website") ?? "").length > 0) return { status: "sent" };

  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    email: String(formData.get("email") ?? "").trim(),
    subject: formData.get("subject") ?? "",
    message: formData.get("message") ?? "",
    consent: formData.get("consent") === "on",
    website: "",
  });
  if (!parsed.success) return { status: "invalid", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const input = parsed.data;

  if (!deps.store && !deps.sendEmail) return { status: "error", reason: "unavailable" };

  const submitterHash = ctx.ip && ctx.hashSalt ? hashWithSalt(ctx.ip, ctx.hashSalt) : null;
  if (deps.store && submitterHash) {
    const allowed = await deps.store
      .consumeRateLimit(`contact:${submitterHash}`, CONTACT_LIMITS.maxAttemptsPerIp, CONTACT_LIMITS.windowSeconds)
      .catch(() => true); // a rate-limit outage must not block real messages
    if (!allowed) return { status: "error", reason: "rate_limited" };
  }

  let stored = false;
  if (deps.store) {
    const key = String(formData.get("idempotencyKey") ?? "");
    try {
      const result = await deps.store.createContactEnquiry(
        {
          idempotencyKey: uuid.safeParse(key).success ? key : crypto.randomUUID(),
          fullName: input.fullName,
          email: input.email,
          subject: input.subject,
          message: input.message,
          consent: true,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        },
        submitterHash,
      );
      if (result.error === "too_many_requests") return { status: "error", reason: "rate_limited" };
      stored = result.ok;
    } catch {
      stored = false;
    }
  }

  let emailed = false;
  if (deps.sendEmail) {
    emailed = await deps.sendEmail({
      subject: `Website message: ${input.subject}`,
      replyTo: input.email,
      text: [`From: ${input.fullName} <${input.email}>`, `Subject: ${input.subject}`, "", input.message].join("\n"),
    });
  }

  return emailed || stored ? { status: "sent" } : { status: "error", reason: "failed" };
}
