"use server";

import { headers } from "next/headers";
import { siteConfig } from "@/config/site";
import { onlineEnquiriesEnabled } from "@/lib/booking/availability";
import { submitContact, type SubmitContactResult } from "@/lib/contact/submit-contact";
import { resendApiKey, sendEmail } from "@/lib/email/resend";
import { supabaseContactStore } from "@/lib/forms/supabase-stores";
import { clientIp } from "@/lib/request";
import { createServiceClient, serverSecrets } from "@/lib/supabase/service";

/** Emails the message to the business (Resend) and keeps a copy in Supabase when storage is on. */
export async function submitContactAction(formData: FormData): Promise<SubmitContactResult> {
  const client = onlineEnquiriesEnabled() ? createServiceClient() : null;
  const to = siteConfig.contact.email;
  return submitContact(
    formData,
    {
      store: client ? supabaseContactStore(client) : null,
      sendEmail: resendApiKey() && to ? (message) => sendEmail({ ...message, to }) : null,
    },
    { ip: clientIp(await headers()), hashSalt: serverSecrets()?.hashSalt ?? null },
  );
}
