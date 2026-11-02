/**
 * Supabase connection settings. Every value comes from the environment, and
 * nothing connects unless all required values are present, so the site keeps
 * working (with online submission off) before a project exists.
 *
 * NEXT_PUBLIC_* values are read with static property access so Next.js can
 * inline them. The secret key and salt are read only in server-only modules.
 */

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function supabasePublicConfig(): SupabasePublicConfig | null {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!url || !publishableKey) return null;
  // Refuse a secret key pasted into the public variable by mistake.
  if (publishableKey.startsWith("sb_secret_")) return null;
  return { url, publishableKey };
}
