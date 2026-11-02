import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "./config";

/**
 * Server-only client using the secret key. It bypasses Row Level Security, so
 * it is used only for the narrow database functions that are granted to
 * service_role (enquiry creation, rate limiting, lookup). Never import this
 * from a client component; the "server-only" import makes that a build error.
 */
export function serverSecrets(): { secretKey: string; hashSalt: string } | null {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  const hashSalt = process.env.SUBMITTER_HASH_SALT?.trim();
  if (!secretKey || !hashSalt) return null;
  return { secretKey, hashSalt };
}

export function createServiceClient(): SupabaseClient | null {
  const config = supabasePublicConfig();
  const secrets = serverSecrets();
  if (!config || !secrets) return null;
  return createClient(config.url, secrets.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
