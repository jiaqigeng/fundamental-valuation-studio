import { expect, test } from "@playwright/test";

test("dash-001 search and select a company by ticker", async ({ page }) => {
  await page.goto("/");

  const tickerInput = page.getByRole("textbox", { name: /ticker/i });
  await expect(tickerInput).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Valuation" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI analysis" })).toBeVisible();

  await tickerInput.fill("NOTATICKER");
  await page.getByRole("button", { name: /open workspace/i }).click();

  await expect(page.locator("#ticker-search-error")).toContainText(
    'Ticker "NOTATICKER" is not valid.',
  );
  await expect(page).toHaveURL("/");

  await tickerInput.fill("AAPL");
  await page.getByRole("button", { name: /open workspace/i }).click();

  await expect(page.getByRole("heading", { name: "Apple Inc." })).toBeVisible();
});
