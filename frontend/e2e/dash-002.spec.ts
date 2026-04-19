import { expect, test } from "@playwright/test";

test("dash-002 displays company identity and key stats", async ({ page }) => {
  await page.goto("/dashboard/AAPL");

  await expect(
    page.getByRole("heading", { level: 1, name: /apple inc\./i }),
  ).toBeVisible();

  const overview = page.getByRole("region", {
    name: /aapl company overview/i,
  });
  await expect(overview.getByText(/^AAPL$/)).toBeVisible();
  await expect(overview.getByText(/technology/i)).toBeVisible();
  await expect(
    overview.getByText(/designs consumer electronics, software, and services/i),
  ).toBeVisible();

  await expect(overview.getByText(/share price/i)).toBeVisible();
  await expect(overview.getByText("$212.48")).toBeVisible();
  await expect(overview.getByText(/market cap/i)).toBeVisible();
  await expect(overview.getByText("$3.2T")).toBeVisible();
});
