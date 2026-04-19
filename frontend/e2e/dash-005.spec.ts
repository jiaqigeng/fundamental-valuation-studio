import { expect, test } from "@playwright/test";

test("dash-005 shows a revenue segment breakdown that reconciles to total revenue", async ({
  page,
}) => {
  await page.goto("/dashboard/AAPL");

  const combinedCard = page
    .locator(".workspace-accordion")
    .filter({ has: page.getByRole("heading", { name: /revenue breakdown and profit bridge/i }) });
  const breakdown = page.getByRole("region", {
    name: /revenue segment breakdown/i,
  });
  const waterfall = page.getByRole("region", {
    name: /revenue to net income waterfall/i,
  });

  await expect(combinedCard).toBeVisible();
  await expect(breakdown).toBeVisible();
  await expect(waterfall).toBeVisible();
  await expect(combinedCard).toContainText("Revenue breakdown by segments");
  await expect(combinedCard).toContainText("Revenue to profits waterfall bridge");
  await expect(breakdown).toContainText("Total revenue");
  await expect(breakdown).toContainText("$391.0B");
  await expect(breakdown.locator(".segment-breakdown-row")).toHaveCount(5);
  await expect(breakdown).toContainText("iPhone");
  await expect(breakdown).toContainText("$201.2B");
  await expect(breakdown).toContainText("Services");
  await expect(breakdown).toContainText("$91.8B");
  await expect(breakdown).toContainText("Reconciles to total revenue: $391.0B.");

  await page.goto("/dashboard/KO");

  const singleSegmentBreakdown = page.getByRole("region", {
    name: /revenue segment breakdown/i,
  });

  await expect(singleSegmentBreakdown).toBeVisible();
  await expect(singleSegmentBreakdown.locator(".segment-breakdown-row")).toHaveCount(1);
  await expect(singleSegmentBreakdown).toContainText("Single reporting segment");
  await expect(singleSegmentBreakdown).toContainText("100.0%");
  await expect(singleSegmentBreakdown).toContainText("$47.1B");
});
