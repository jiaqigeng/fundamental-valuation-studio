import { expect, test } from "@playwright/test";

test("dash-002 displays company identity and key stats", async ({ page }) => {
  await page.goto("/dashboard/AAPL");

  const overview = page.getByRole("region", {
    name: /aapl company overview/i,
  });
  await expect(overview.getByRole("heading", { name: /apple inc\./i })).toBeVisible();
  await expect(overview.getByText(/^AAPL$/)).toBeVisible();
  await expect(overview.getByText(/technology/i)).toBeVisible();
  await expect(
    overview.getByText(/designs consumer electronics, software, and services/i),
  ).toBeVisible();

  const keyStats = page.getByRole("region", { name: /key stats/i });
  await expect(keyStats.getByText(/share price/i)).toBeVisible();
  await expect(keyStats.getByText("$212.48")).toBeVisible();
  await expect(keyStats.getByText(/market cap/i)).toBeVisible();
  await expect(keyStats.getByText("$3.2T")).toBeVisible();
});
