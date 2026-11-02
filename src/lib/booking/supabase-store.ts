import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateEnquiryResult, EnquiryStore } from "./submit-enquiry";

/** EnquiryStore backed by the database functions granted to service_role. */
export function supabaseEnquiryStore(client: SupabaseClient): EnquiryStore {
  return {
    async consumeRateLimit(bucket, maxHits, windowSeconds) {
      const { data, error } = await client.rpc("consume_rate_limit", {
        p_bucket: bucket,
        p_max_hits: maxHits,
        p_window_seconds: windowSeconds,
      });
      if (error) throw new Error("rate_limit_unavailable");
      return data === true;
    },
    async createEnquiry(payload, submitterHash) {
      const { data, error } = await client.rpc("create_booking_enquiry", {
        p: payload,
        p_submitter_hash: submitterHash,
      });
      // The function raises stable codes such as "arrival_in_past" as the message.
      if (error) throw new Error(error.message);
      return data as CreateEnquiryResult;
    },
  };
}
