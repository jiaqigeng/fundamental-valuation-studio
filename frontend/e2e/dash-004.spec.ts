import { expect, test, type Locator } from "@playwright/test";

test("dash-004 shows a revenue-to-net-income waterfall that updates by company", async ({
  page,
}) => {
  await page.goto("/dashboard/AAPL");

  const waterfall = page.getByRole("region", {
    name: /revenue to net income waterfall/i,
  });

  await expect(waterfall).toBeVisible();
  await expect(
    waterfall.getByLabel("Revenue to net income waterfall chart"),
  ).toBeVisible();
  await expectWaterfallMetric(waterfall, "Revenue", "$391.0B");
  await expectWaterfallMetric(waterfall, "COGS", "-$223.5B");
  await expectWaterfallMetric(waterfall, "OpEx", "-$57.5B");
  await expectWaterfallMetric(waterfall, "Interest", "-$3.9B");
  await expectWaterfallMetric(waterfall, "Tax", "-$17.2B");
  await expectWaterfallMetric(waterfall, "Net Income", "$87.5B");

  await page.goto("/dashboard/KO");

  const consumerWaterfall = page.getByRole("region", {
    name: /revenue to net income waterfall/i,
  });

  await expect(consumerWaterfall).toBeVisible();
  await expectWaterfallMetric(consumerWaterfall, "Revenue", "$47.1B");
  await expectWaterfallMetric(consumerWaterfall, "COGS", "-$18.5B");
  await expectWaterfallMetric(consumerWaterfall, "Other Items", "$0.6B");
  await expectWaterfallMetric(consumerWaterfall, "Net Income", "$11.0B");
});

async function expectWaterfallMetric(
  section: Locator,
  label: string,
  value: string,
) {
  const metricCard = section.locator(".waterfall-step-card").filter({ hasText: label });
  await expect(metricCard).toContainText(label);
  await expect(metricCard).toContainText(value);
}
