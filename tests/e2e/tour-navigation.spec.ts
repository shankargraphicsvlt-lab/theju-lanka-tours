import { expect, test } from "@playwright/test";
import { tours } from "../../src/content/tours";

const expectedTotals: Record<number, string> = {
  5: "US$276.25",
  7: "US$386.75",
  10: "US$552.50",
  12: "US$663.00",
  15: "US$828.75",
};

test.describe("tour detail navigation", () => {
  for (const tour of tours) {
    test(`card for "${tour.title}" opens its own detail page`, async ({ page }) => {
      await page.goto("/tours");
      await page.getByRole("link", { name: tour.title, exact: true }).click();

      await expect(page).toHaveURL(new RegExp(`/tours/${tour.slug}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(tour.title);

      const priceBox = page.getByRole("complementary", { name: "Price and enquiry" });
      await expect(priceBox).toContainText(expectedTotals[tour.durationDays]!);
      await expect(priceBox).toContainText(`${tour.durationDays} package days × US$65.00`);
      await expect(priceBox).toContainText("Discount (15%)");
      await expect(priceBox).toContainText("For 2 people");
      await expect(priceBox).toContainText("not per person");

      await expect(priceBox.getByRole("link", { name: "Book on WhatsApp" })).toBeVisible();

      // Package duration and hotel nights are shown separately, in the trip details.
      const details = page.getByRole("region", { name: "Trip details" });
      await expect(details).toContainText(`${tour.durationDays} days, from arrival to departure`);
      await expect(details).toContainText(`${tour.durationDays - 1} nights of accommodation`);
    });
  }

  test("a filtered card still links to the right tour", async ({ page }) => {
    await page.goto("/tours?experience=wellness");
    await page.getByRole("link", { name: "The Grand Tour of Sri Lanka", exact: true }).click();
    await expect(page).toHaveURL(/\/tours\/grand-tour-of-sri-lanka$/);
  });

  test("homepage tour cards link to their detail pages", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Classic Sri Lanka", exact: true }).click();
    await expect(page).toHaveURL(/\/tours\/classic-sri-lanka$/);
  });

  test("an unknown tour returns the 404 page", async ({ page }) => {
    const response = await page.goto("/tours/not-a-tour");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This path leads off the map" })).toBeVisible();
  });

  test("the enquiry button pre-selects the tour", async ({ page }) => {
    await page.goto("/tours/classic-sri-lanka");
    await page.getByRole("link", { name: "Enquire about this tour" }).click();
    await expect(page).toHaveURL(/plan-your-trip\?tour=classic-sri-lanka/);
    await expect(page.getByRole("combobox", { name: "Tour", exact: true })).toHaveValue("classic-sri-lanka");
  });
});
