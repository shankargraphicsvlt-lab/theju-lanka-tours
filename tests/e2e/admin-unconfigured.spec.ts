import nextEnv from "@next/env";
import { expect, test } from "@playwright/test";
import { supabasePublicConfig } from "../../src/lib/supabase/config";

// Load .env* files the way `next start` does, then use the app's own check, so
// the skip below matches exactly what the server under test sees.
// (@next/env is CommonJS, so it is imported as a default export.)
nextEnv.loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });
const supabaseConfigured = supabasePublicConfig() !== null;

// Without Supabase settings the staff area must not exist, and the enquiry form
// must still say that nothing is sent or stored.
test.describe("without Supabase configured", () => {
  for (const path of ["/admin", "/admin/login"]) {
    test(`${path} returns 404`, async ({ page }) => {
      test.skip(
        supabaseConfigured,
        "Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) are set, so the admin area is enabled by design; this check only applies to an unconfigured server.",
      );
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
    });
  }

  test("the enquiry form stays in check-only mode", async ({ page }) => {
    test.skip(
      supabaseConfigured && process.env.BOOKING_SUBMISSIONS_ENABLED?.trim() === "true",
      "Online enquiries are switched on (BOOKING_SUBMISSIONS_ENABLED=true with Supabase configured), so the form sends for real by design.",
    );
    await page.goto("/plan-your-trip");
    await expect(page.getByText("nothing will be sent or stored yet")).toBeVisible();
    await expect(page.getByRole("button", { name: "Check my enquiry" })).toBeVisible();
  });
});
