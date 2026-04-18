import { expect, test } from "@playwright/test";

test("dash-001 search and select a company by ticker", async ({ page }) => {
  await page.goto("/");

  const tickerInput = page.getByRole("textbox", { name: /ticker/i });
  await expect(tickerInput).toBeVisible();

  await tickerInput.fill("AAPL");
  await page.getByRole("button", { name: /search|load|analyze/i }).click();

  await expect(page.getByText(/apple|aapl/i)).toBeVisible();
});
