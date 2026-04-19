import { expect, test } from "@playwright/test";

test("dash-004 shows key financial metrics for the selected company", async ({
  page,
}) => {
  await page.goto("/dashboard/AAPL");

  const keyMetrics = page.getByRole("region", {
    name: /key financial metrics/i,
  });

  await expect(keyMetrics).toBeVisible();
  await expect(keyMetrics.getByText(/revenue \(ttm\)/i)).toBeVisible();
  await expect(keyMetrics.getByText("$395.8B")).toBeVisible();
  await expect(keyMetrics.getByText(/eps \(ttm\)/i)).toBeVisible();
  await expect(keyMetrics.getByText("6.73")).toBeVisible();
  await expect(keyMetrics.getByText(/free cash flow/i)).toBeVisible();
  await expect(keyMetrics.getByText("$99.6B")).toBeVisible();
  await expect(keyMetrics.getByText(/gross margin/i)).toBeVisible();
  await expect(keyMetrics.getByText("46.20%")).toBeVisible();
  await expect(keyMetrics.getByText(/operating margin/i)).toBeVisible();
  await expect(keyMetrics.getByText("31.50%")).toBeVisible();
  await expect(keyMetrics.getByText(/return on equity \(roe\)/i)).toBeVisible();
  await expect(keyMetrics.getByText("151.32%")).toBeVisible();
});
