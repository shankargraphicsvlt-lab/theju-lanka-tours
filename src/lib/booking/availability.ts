import "server-only";
import { supabasePublicConfig } from "@/lib/supabase/config";
import { serverSecrets } from "@/lib/supabase/service";

/**
 * Saving form submissions to Supabase (trip enquiries, contact-message backups
 * and newsletter sign-ups) is on only when BOOKING_SUBMISSIONS_ENABLED=true AND
 * every Supabase value is configured. Until then nothing is written.
 */
export function onlineEnquiriesEnabled(): boolean {
  return (
    process.env.BOOKING_SUBMISSIONS_ENABLED?.trim() === "true" &&
    supabasePublicConfig() !== null &&
    serverSecrets() !== null
  );
}
