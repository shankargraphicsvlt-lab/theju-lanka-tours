import { expect, test, type Page } from "@playwright/test";

const estimate = (page: Page) => page.getByTestId("trip-estimate");

async function openPlanner(page: Page, query = "?tour=classic-sri-lanka") {
  await page.goto(`/plan-your-trip${query}`);
  await page.waitForLoadState("networkidle");
}

test.describe("group pricing: USD 65/day for 2 people", () => {
  test("every tour card is labelled 'For 2 people'", async ({ page }) => {
    await page.goto("/tours");
    await expect(page.locator("main article").getByText("For 2 people", { exact: true })).toHaveCount(5);
  });

  test("the estimate for 2 adults shows the group total", async ({ page }) => {
    await openPlanner(page);
    await expect(estimate(page)).toContainText("US$552.50");
    await expect(estimate(page)).toContainText("For 2 people");
  });

  test("a group of 3 needs a custom quote, and the rate is not multiplied", async ({ page }) => {
    await openPlanner(page);
    await page.fill("#enq-adults", "3");
    await expect(estimate(page)).toContainText("Custom quote required");
    await expect(estimate(page)).toContainText("group of 3");
    await expect(estimate(page)).not.toContainText("US$");
  });

  test("a solo traveller needs a custom quote", async ({ page }) => {
    await openPlanner(page);
    await page.fill("#enq-adults", "1");
    await expect(estimate(page)).toContainText("Custom quote required");
    await expect(estimate(page)).toContainText("solo traveller");
  });

  test("children are not priced: custom quote", async ({ page }) => {
    await openPlanner(page);
    await page.fill("#enq-children", "1");
    await expect(estimate(page)).toContainText("Custom quote required");
    await expect(estimate(page)).toContainText("Child pricing has not been confirmed");
    await page.fill("#enq-children", "0");
    await expect(estimate(page)).toContainText("US$552.50");
  });

  test("the trip finder's traveller count carries through", async ({ page }) => {
    await openPlanner(page, "?tour=classic-sri-lanka&adults=4");
    await expect(estimate(page)).toContainText("Custom quote required");
  });
});
