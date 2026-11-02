"use server";

import { headers } from "next/headers";
import { onlineEnquiriesEnabled } from "@/lib/booking/availability";
import { supabaseNewsletterStore } from "@/lib/forms/supabase-stores";
import { subscribeToNewsletter, type SubscribeResult } from "@/lib/newsletter/subscribe";
import { clientIp } from "@/lib/request";
import { createServiceClient, serverSecrets } from "@/lib/supabase/service";

export async function subscribeAction(formData: FormData): Promise<SubscribeResult> {
  const client = onlineEnquiriesEnabled() ? createServiceClient() : null;
  return subscribeToNewsletter(formData, client ? supabaseNewsletterStore(client) : null, {
    ip: clientIp(await headers()),
    hashSalt: serverSecrets()?.hashSalt ?? null,
  });
}
