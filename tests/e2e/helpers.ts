import { expect, type Page } from "@playwright/test";

/** Navigates and waits until the filter form has hydrated, so change events reach React. */
export async function gotoFilters(page: Page, url: string) {
  // Don't wait for every image: the first request for each one is converted to AVIF on a cold server.
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await expect(page.locator("form[role=search]")).toHaveAttribute("data-ready", "true");
}
