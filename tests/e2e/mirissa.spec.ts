import { expect, test } from "@playwright/test";

test.describe("Mirissa destination", () => {
  test("appears in the homepage destinations grid and opens its own page", async ({ page }) => {
    await page.goto("/");
    const grid = page.locator("section[aria-labelledby='destinations-title']");
    const link = grid.getByRole("link", { name: "Mirissa", exact: true });
    await expect(link).toHaveAttribute("href", "/destinations/mirissa");
    await link.click();
    await expect(page).toHaveURL(/\/destinations\/mirissa$/);
    await expect(page.getByRole("heading", { level: 1, name: "Mirissa" })).toBeVisible();
  });

  test("is listed on the destinations page with the other route stops", async ({ page }) => {
    await page.goto("/destinations");
    const section = page.locator("section[aria-labelledby='route-places-title']");
    await expect(section.getByRole("link", { name: "Mirissa", exact: true })).toHaveAttribute("href", "/destinations/mirissa");
  });

  test("its hero image is described and carries no illustration badge", async ({ page }) => {
    await page.goto("/destinations/mirissa");
    const hero = page.locator("section[aria-labelledby='place-title']");
    await expect(hero.getByRole("img", { name: "Mirissa", exact: true })).toBeVisible();
    await expect(hero.getByText("Illustration", { exact: true })).toHaveCount(0);
  });
});
