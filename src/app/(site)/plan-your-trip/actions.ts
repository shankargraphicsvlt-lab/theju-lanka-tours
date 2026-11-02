"use server";

import { headers } from "next/headers";
import { todayIso } from "@/lib/dates";
import { onlineEnquiriesEnabled } from "@/lib/booking/availability";
import { submitEnquiry, type SubmitEnquiryResult } from "@/lib/booking/submit-enquiry";
import { supabaseEnquiryStore } from "@/lib/booking/supabase-store";
import { clientIp } from "@/lib/request";
import { createServiceClient, serverSecrets } from "@/lib/supabase/service";

export async function submitEnquiryAction(formData: FormData): Promise<SubmitEnquiryResult> {
  const client = onlineEnquiriesEnabled() ? createServiceClient() : null;
  const secrets = serverSecrets();
  if (!client || !secrets) {
    return { status: "error", message: "Online enquiries are not active yet. Please contact us directly." };
  }
  return submitEnquiry(formData, supabaseEnquiryStore(client), {
    ip: clientIp(await headers()),
    hashSalt: secrets.hashSalt,
    today: todayIso(),
    now: Date.now(),
  });
}
