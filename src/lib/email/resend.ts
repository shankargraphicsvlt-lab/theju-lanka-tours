import "server-only";

/**
 * Sends email through Resend's HTTP API (https://resend.com), with no SDK.
 * Needs RESEND_API_KEY. Until a domain is verified in Resend, the sender must
 * be onboarding@resend.dev, which only delivers to the email address that owns
 * the Resend account; so create the account with the business address.
 */

const DEFAULT_FROM = "GSKT Lanka Tours <onboarding@resend.dev>";

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

export function resendApiKey(): string | null {
  return process.env.RESEND_API_KEY?.trim() || null;
}

/** True when Resend accepted the message. Never throws; failures are reported as false. */
export async function sendEmail(message: OutgoingEmail): Promise<boolean> {
  const key = resendApiKey();
  if (!key) return false;
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL?.trim() || DEFAULT_FROM,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
