import { z } from "zod";
import { hashWithSalt } from "@/lib/booking/submit-enquiry";

/**
 * Newsletter sign-up, independent of Next.js and Supabase so it can be tested
 * with a fake store. Emails are stored lower-case in public.newsletter_subscribers.
 */

export const NEWSLETTER_LIMITS = { maxAttemptsPerIp: 5, windowSeconds: 3600 } as const;

export interface NewsletterStore {
  consumeRateLimit(bucket: string, maxHits: number, windowSeconds: number): Promise<boolean>;
  /** `duplicate: true` when the address is already subscribed. */
  subscribe(email: string, submitterHash: string | null): Promise<{ duplicate: boolean }>;
}

export type SubscribeResult =
  | { status: "subscribed" }
  | { status: "already" }
  | { status: "invalid"; message: string }
  | { status: "error"; reason: "unavailable" | "rate_limited" | "failed" };

const emailSchema = z.email("Please enter a valid email address").max(254);

export async function subscribeToNewsletter(
  formData: FormData,
  store: NewsletterStore | null,
  ctx: { ip: string | null; hashSalt: string | null },
): Promise<SubscribeResult> {
  if (String(formData.get("website") ?? "").length > 0) return { status: "subscribed" }; // honeypot

  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!parsed.success) return { status: "invalid", message: parsed.error.issues[0]?.message ?? "Please enter a valid email address" };
  if (!store) return { status: "error", reason: "unavailable" };

  const submitterHash = ctx.ip && ctx.hashSalt ? hashWithSalt(ctx.ip, ctx.hashSalt) : null;
  try {
    if (submitterHash) {
      const allowed = await store.consumeRateLimit(
        `newsletter:${submitterHash}`,
        NEWSLETTER_LIMITS.maxAttemptsPerIp,
        NEWSLETTER_LIMITS.windowSeconds,
      );
      if (!allowed) return { status: "error", reason: "rate_limited" };
    }
    const { duplicate } = await store.subscribe(parsed.data, submitterHash);
    return duplicate ? { status: "already" } : { status: "subscribed" };
  } catch {
    return { status: "error", reason: "failed" };
  }
}
