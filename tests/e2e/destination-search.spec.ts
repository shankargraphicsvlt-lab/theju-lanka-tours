import { expect, test, type Page } from "@playwright/test";
import { gotoFilters } from "./helpers";

const heading = (page: Page, name: string) => page.getByRole("heading", { level: 2, name, exact: true });
const select = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });
const searchbox = (page: Page) => page.getByRole("searchbox", { name: "Search", exact: true });

test.describe("destination search and filters", () => {
  test("shows all six destinations by default", async ({ page }) => {
    await gotoFilters(page, "/destinations");
    await expect(page.getByTestId("result-count")).toHaveText("Showing all 6 destinations");
  });

  test("search narrows results and updates the URL", async ({ page }) => {
    await gotoFilters(page, "/destinations");
    await searchbox(page).fill("lighthouse");
    await expect(page).toHaveURL(/\?q=lighthouse/);
    await expect(page.getByTestId("result-count")).toHaveText("1 destination found");
    await expect(heading(page, "Galle")).toBeVisible();
    await expect(heading(page, "Kandy")).toHaveCount(0);
    // Focus stays in the search box while results update.
    await expect(searchbox(page)).toBeFocused();
  });

  test("region and interest filters combine", async ({ page }) => {
    await gotoFilters(page, "/destinations");
    await select(page, "Region").selectOption("Hill Country");
    await expect(page).toHaveURL(/region=Hill\+Country/);
    await expect(page.getByTestId("result-count")).toHaveText("2 destinations found");
    await select(page, "Interest").selectOption("rail");
    await expect(page.getByTestId("result-count")).toHaveText("1 destination found");
    await expect(heading(page, "Ella")).toBeVisible();
  });

  test("shows an empty state and can be cleared", async ({ page }) => {
    await gotoFilters(page, "/destinations?q=glacier");
    await expect(page.getByRole("heading", { name: "No destinations match your search" })).toBeVisible();
    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(page).toHaveURL(/\/destinations$/);
    await expect(page.getByTestId("result-count")).toHaveText("Showing all 6 destinations");
    await expect(searchbox(page)).toHaveValue("");
  });

  test("deep links pre-fill the filters", async ({ page }) => {
    await gotoFilters(page, "/destinations?region=Deep+South");
    await expect(select(page, "Region")).toHaveValue("Deep South");
    await expect(heading(page, "Yala")).toBeVisible();
  });

  test("ignores unknown filter values", async ({ page }) => {
    await gotoFilters(page, "/destinations?region=Atlantis&interest=casino");
    await expect(page.getByTestId("result-count")).toHaveText("Showing all 6 destinations");
  });
});

test.describe("destination search without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the search form still works as a normal GET form", async ({ page }) => {
    await page.goto("/destinations");
    await searchbox(page).fill("whale");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page).toHaveURL(/q=whale/);
    await expect(heading(page, "South Coast")).toBeVisible();
    await expect(heading(page, "Kandy")).toHaveCount(0);
  });
});
