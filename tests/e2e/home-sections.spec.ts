import { expect, test } from "@playwright/test";
import { SHOW_BLOG, SHOW_TESTIMONIALS } from "../../src/config/site";

test.describe("homepage sections", () => {
  test("shows the sections in order", async ({ page }) => {
    await page.goto("/");
    const titles = await page.locator("main h2[id]").allTextContents();
    const order = [
      "Places That Inspire",
      "More Than Just Trips",
      "Curated Just for You",
      "The Island Is Calling",
      ...(SHOW_TESTIMONIALS ? ["Real Stories. Real Smiles."] : []),
      ...(SHOW_BLOG ? ["Stories to Fuel Your Next Trip"] : []),
      "Let's Stay in Touch",
    ];
    const positions = order.map((t) => titles.indexOf(t));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  test("the search card filters the tours page by destination and trip length", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Where to").selectOption("ella");
    await page.getByLabel("Arrival").fill("2027-02-01");
    await page.getByLabel("Departure").fill("2027-02-07");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/\/tours\?destination=ella&duration=up-to-7$/);
  });

  test("tour cards show the group price, never a per-person price", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("section[aria-labelledby='curated-title']");
    await expect(section.getByRole("article")).toHaveCount(4);
    await expect(section.getByText("Total for 2 people").first()).toBeVisible();
    await expect(section.getByText(/Prices are for 2 people and cover vehicle, driver-guide/)).toBeVisible();
    await expect(section.getByText("Per person", { exact: true })).toHaveCount(0);
  });

  test("testimonials and travel guides follow their flags, and the newsletter form is live", async ({ page }) => {
    await page.goto("/");
    const heading = page.getByRole("heading", { name: "Real Stories. Real Smiles." });
    await expect(heading).toHaveCount(SHOW_TESTIMONIALS ? 1 : 0);
    await expect(page.getByRole("heading", { name: "Stories to Fuel Your Next Trip" })).toHaveCount(SHOW_BLOG ? 1 : 0);
    await expect(page.getByText(/placeholder/i)).toHaveCount(0);
    await expect(page.getByText("Newsletter sign-up opens soon.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Subscribe" })).toBeEnabled();
  });

  test("the newsletter form checks the email address before sending", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Email address").fill("not-an-email");
    await page.getByRole("button", { name: "Subscribe" }).click();
    await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  });

  test("the footer has quick links, support and contact columns", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("navigation", { name: "Quick links" })).toBeVisible();
    await expect(footer.getByRole("navigation", { name: "Support" })).toBeVisible();
    await expect(footer.getByText("Contact us")).toBeVisible();
    await expect(footer.getByText("Explore. Dream. Discover.")).toBeVisible();
  });
});
