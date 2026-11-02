import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContactStore } from "@/lib/contact/submit-contact";
import type { NewsletterStore } from "@/lib/newsletter/subscribe";

async function consumeRateLimit(client: SupabaseClient, bucket: string, maxHits: number, windowSeconds: number) {
  const { data, error } = await client.rpc("consume_rate_limit", {
    p_bucket: bucket,
    p_max_hits: maxHits,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error("rate_limit_unavailable");
  return data === true;
}

/** Contact messages go to public.contact_enquiries through its service_role function. */
export function supabaseContactStore(client: SupabaseClient): ContactStore {
  return {
    consumeRateLimit: (bucket, maxHits, windowSeconds) => consumeRateLimit(client, bucket, maxHits, windowSeconds),
    async createContactEnquiry(payload, submitterHash) {
      const { data, error } = await client.rpc("create_contact_enquiry", { p: payload, p_submitter_hash: submitterHash });
      if (error) throw new Error(error.message);
      return data as { ok: boolean; error?: string };
    },
  };
}

/** Newsletter sign-ups go to public.newsletter_subscribers through its service_role function. */
export function supabaseNewsletterStore(client: SupabaseClient): NewsletterStore {
  return {
    consumeRateLimit: (bucket, maxHits, windowSeconds) => consumeRateLimit(client, bucket, maxHits, windowSeconds),
    async subscribe(email, submitterHash) {
      const { data, error } = await client.rpc("subscribe_newsletter", { p_email: email, p_submitter_hash: submitterHash });
      if (error) throw new Error(error.message);
      return { duplicate: (data as { duplicate?: boolean } | null)?.duplicate === true };
    },
  };
}
