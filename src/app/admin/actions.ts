"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { adminAreaConfigured } from "@/lib/admin/auth";
import { hashWithSalt } from "@/lib/booking/submit-enquiry";
import { createServiceClient, serverSecrets } from "@/lib/supabase/service";
import { createSessionClient } from "@/lib/supabase/server";

export interface SignInState {
  error: string | null;
}

const credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

// One message for every failure, so the form never reveals which accounts exist or have access.
const FAILED = "Sign-in failed. Check your details, or ask an administrator for access.";

async function loginAllowed(): Promise<boolean> {
  const client = createServiceClient();
  const secrets = serverSecrets();
  // Without the secret key there is no app-level limit; Supabase Auth still applies its own.
  if (!client || !secrets) return true;
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const { data, error } = await client.rpc("consume_rate_limit", {
    p_bucket: `admin-login:ip:${hashWithSalt(ip, secrets.hashSalt)}`,
    p_max_hits: 5,
    p_window_seconds: 900,
  });
  return !error && data === true;
}

export async function signInAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!adminAreaConfigured()) return { error: FAILED };
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: FAILED };
  if (!(await loginAllowed())) return { error: "Too many attempts. Please wait 15 minutes and try again." };

  const client = await createSessionClient();
  if (!client) return { error: FAILED };
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) return { error: FAILED };

  const { data: role, error: roleError } = await client.rpc("current_admin_role");
  if (roleError || (role !== "admin" && role !== "staff")) {
    await client.auth.signOut();
    return { error: FAILED };
  }
  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const client = await createSessionClient();
  await client?.auth.signOut();
  redirect("/admin/login");
}
