import { expect, test } from "@playwright/test";

test.describe("pre-launch audit fixes", () => {
  test("itineraries are described as suggested, never as samples", async ({ page }) => {
    for (const path of ["/", "/tours", "/destinations", "/destinations/ella", "/contact", "/plan-your-trip", "/saved", "/terms"]) {
      await page.goto(path);
      await expect(page.locator("main"), path).not.toContainText(/\bsample/i);
    }
    await page.goto("/tours");
    await expect(page.getByText("Suggested itinerary").first()).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Tour packages" })).toHaveAttribute("href", "/tours");
  });

  test("the saved page has a serif h1", async ({ page }) => {
    await page.goto("/saved");
    const h1 = page.getByRole("heading", { level: 1, name: "Saved tours" });
    await expect(h1).toBeVisible();
    expect(await h1.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Cormorant/);
  });

  test("the search card's form is a labelled form inside the tab panel", async ({ page }) => {
    await page.goto("/");
    const panel = page.getByRole("tabpanel", { name: "Tours" });
    await expect(panel.getByRole("form", { name: "Search tours" })).toBeVisible();
    await page.getByRole("tab", { name: "Stays" }).click();
    await expect(page.getByRole("tabpanel", { name: "Stays" }).getByRole("form", { name: "Search stays" })).toBeVisible();
  });

  test("the logo link's name matches its visible text", async ({ page }) => {
    await page.goto("/");
    const logo = page.getByRole("banner").getByRole("link", { name: "GSKT Lanka Tours", exact: true }).first();
    await expect(logo).toBeVisible();
    expect((await logo.textContent())?.replace(/\s+/g, " ").trim().toLowerCase()).toBe("gskt lanka tours");
  });

  test("the 404 page has its own title and description", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await expect(page).toHaveTitle("Page not found | GSKT Lanka Tours");
    const description = await page.locator("meta[name='description']").getAttribute("content");
    expect(description).toMatch(/^Sorry, this page doesn't exist/);
  });
});
