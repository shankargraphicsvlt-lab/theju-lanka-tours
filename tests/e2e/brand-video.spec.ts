import { expect, test } from "@playwright/test";

// Playback itself is not tested here (the bundled Chromium has no H.264/AAC); this covers loading, focus and closing.
test.describe("brand video", () => {
  test("'Watch our story' opens the video modal, loads the full video only then, and Escape closes it", async ({ page }) => {
    const fullRequests: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("gskt-story-1080")) fullRequests.push(r.url());
    });
    await page.goto("/");
    expect(fullRequests).toHaveLength(0);

    const watch = page.getByRole("button", { name: "Watch our story" });
    await watch.click();
    const dialog = page.getByRole("dialog", { name: "GSKT Lanka Tours brand video" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("video")).toHaveAttribute("src", "/video/gskt-story-1080.mp4");
    await expect(page.getByRole("button", { name: "Close video" })).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(watch).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("the contact page shows the silent loop with a sound button that opens the same modal", async ({ page }) => {
    await page.goto("/contact");
    const loop = page.locator("main video[aria-label='GSKT Lanka Tours brand video']");
    await expect(loop).toHaveAttribute("poster", "/video/gskt-story-poster.jpg");
    await expect(loop.locator("source")).toHaveAttribute("src", "/video/gskt-story-loop-720.mp4");
    // The suite runs with reduced motion: no autoplay, a play button instead.
    await expect(page.getByRole("button", { name: "Play video" })).toBeVisible();

    const sound = page.getByRole("button", { name: "Watch with sound" });
    await sound.click();
    await expect(page.getByRole("dialog", { name: "GSKT Lanka Tours brand video" })).toBeVisible();
    await page.getByRole("button", { name: "Close video" }).click();
    await expect(sound).toBeFocused();
  });
});
