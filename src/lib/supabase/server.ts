import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "./config";

/**
 * Per-request client acting as the signed-in user (publishable key + session
 * cookie). Row Level Security applies to every query it makes, which is how
 * the admin area reads bookings.
 */
export async function createSessionClient(): Promise<SupabaseClient | null> {
  const config = supabasePublicConfig();
  if (!config) return null;
  const cookieStore = await cookies();
  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // proxy.ts refreshes the session cookie on the next request instead.
        }
      },
    },
  });
}
