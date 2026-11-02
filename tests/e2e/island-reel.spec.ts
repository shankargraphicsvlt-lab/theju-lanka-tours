import { expect, test } from "@playwright/test";

// The suite runs with reduced motion (playwright.config.ts): scenes change instantly and nothing autoplays.
test.describe("homepage photo reel", () => {
  test("moves between destinations with the buttons and wraps around", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title']");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Discover Sri Lanka, Your Way.");
    const scene = hero.getByRole("heading", { level: 2 });
    await expect(scene).toHaveText("Sigiriya & Dambulla");

    await hero.getByRole("button", { name: "Next destination" }).click();
    await expect(scene).toHaveText("Ella");
    await expect(hero.getByRole("link", { name: "Discover Ella" })).toHaveAttribute("href", "/destinations/ella");
    await expect(hero.getByRole("img", { name: "Ella", exact: true })).toBeVisible();

    await hero.getByRole("button", { name: "Previous destination" }).click();
    await expect(scene).toHaveText("Sigiriya & Dambulla");
    await hero.getByRole("button", { name: "Previous destination" }).click();
    await expect(scene).toHaveText("Negombo");
  });

  test("shows no illustration badge and does not trap page scrolling", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByText("Illustration", { exact: true })).toHaveCount(0);
    await hero.hover();
    await page.mouse.wheel(0, 500);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test("hides the slideshow control for reduced motion and offers pause when motion is allowed", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section[aria-labelledby='hero-title']");
    await expect(hero.getByRole("button", { name: /slideshow/ })).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: "no-preference" });
    const pause = hero.getByRole("button", { name: "Pause slideshow" });
    await pause.click();
    await expect(hero.getByRole("button", { name: "Play slideshow" })).toHaveAttribute("aria-pressed", "true");
    await hero.getByRole("button", { name: "Next destination" }).click();
    await expect(hero.getByRole("heading", { level: 2 })).toHaveText("Ella");
  });
});
