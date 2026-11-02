import { expect, test, type Page } from "@playwright/test";
import { gotoFilters } from "./helpers";

const cardTitles = (page: Page) => page.locator("main article h3");
const select = (page: Page, name: string) => page.getByRole("combobox", { name, exact: true });

test.describe("tour listing filters", () => {
  test("lists all five sample tours by default", async ({ page }) => {
    await gotoFilters(page, "/tours");
    await expect(page.getByTestId("result-count")).toHaveText("Showing all 5 tours");
    await expect(cardTitles(page)).toHaveCount(5);
  });

  test("filters by package duration", async ({ page }) => {
    await gotoFilters(page, "/tours");
    await select(page, "Package duration").selectOption("12-plus");
    await expect(page).toHaveURL(/duration=12-plus/);
    await expect(cardTitles(page)).toHaveText(["Ancient Kingdoms & Wild Places", "The Grand Tour of Sri Lanka"]);
  });

  test("filters by destination", async ({ page }) => {
    await gotoFilters(page, "/tours");
    await select(page, "Destination").selectOption("galle");
    await expect(page).toHaveURL(/destination=galle/);
    await expect(page.getByTestId("result-count")).toHaveText("3 tours found");
  });

  test("filters by experience type", async ({ page }) => {
    await gotoFilters(page, "/tours");
    await select(page, "Experience type").selectOption("wildlife");
    await expect(cardTitles(page)).toHaveText([
      "Classic Sri Lanka",
      "Ancient Kingdoms & Wild Places",
      "The Grand Tour of Sri Lanka",
    ]);
  });

  test("combined filters can produce an empty state with a way out", async ({ page }) => {
    await gotoFilters(page, "/tours?duration=up-to-7&destination=yala");
    await expect(page.getByRole("heading", { name: "No suggested tours match these filters" })).toBeVisible();
    await page.getByRole("link", { name: "Clear filters", exact: true }).click();
    await expect(page.getByTestId("result-count")).toHaveText("Showing all 5 tours");
    await expect(select(page, "Package duration")).toHaveValue("");
    await expect(select(page, "Destination")).toHaveValue("");
  });

  test("deep links pre-fill the selects", async ({ page }) => {
    await gotoFilters(page, "/tours?duration=up-to-7&experience=rail");
    await expect(select(page, "Package duration")).toHaveValue("up-to-7");
    await expect(select(page, "Experience type")).toHaveValue("rail");
    await expect(cardTitles(page)).toHaveText(["Hill Country Rail & Southern Shores"]);
  });
});

test.describe("tour filters without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("submitting the form filters server-side", async ({ page }) => {
    await page.goto("/tours");
    await select(page, "Package duration").selectOption("8-11");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page).toHaveURL(/duration=8-11/);
    await expect(cardTitles(page)).toHaveText(["Classic Sri Lanka"]);
  });
});
