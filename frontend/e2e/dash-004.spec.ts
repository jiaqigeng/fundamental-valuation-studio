import { expect, test, type Locator } from "@playwright/test";

test("dash-004 shows a revenue-to-net-income waterfall that updates by company", async ({
  page,
}) => {
  await page.goto("/dashboard/AAPL");

  const waterfall = page.getByRole("region", {
    name: /revenue to net income waterfall/i,
  });

  await expect(waterfall).toBeVisible();
  const waterfallChart = waterfall.getByLabel("Revenue to net income waterfall chart");
  await expect(waterfallChart).toBeVisible();
  await expect(waterfallChart.locator("path.waterfall-chart-connector")).toHaveCount(7);
  await expect(waterfallChart.locator("line.waterfall-chart-baseline")).toHaveCount(0);
  await expect(waterfallChart.locator("text").filter({ hasText: /^\$0$/ })).toHaveCount(1);
  await expectWaterfallMetric(waterfall, "Revenue", "$391.0B");
  await expectWaterfallMetric(waterfall, "Cost of Revenue", "-$223.5B");
  await expectWaterfallMetric(waterfall, "Gross Profit", "$167.5B");
  await expectWaterfallMetric(waterfall, "Operating Expenses", "-$57.5B");
  await expectWaterfallMetric(waterfall, "Operating Profit", "$110.0B");
  await expectWaterfallMetric(waterfall, "Other Income / Cost", "-$5.3B");
  await expectWaterfallMetric(waterfall, "Taxes", "-$17.2B");
  await expectWaterfallMetric(waterfall, "Net Profits", "$87.5B");

  await page.goto("/dashboard/KO");

  const consumerWaterfall = page.getByRole("region", {
    name: /revenue to net income waterfall/i,
  });

  await expect(consumerWaterfall).toBeVisible();
  const consumerWaterfallChart = consumerWaterfall.getByLabel(
    "Revenue to net income waterfall chart",
  );
  await expect(consumerWaterfallChart.locator("path.waterfall-chart-connector")).toHaveCount(
    7,
  );
  await expectWaterfallMetric(consumerWaterfall, "Revenue", "$47.1B");
  await expectWaterfallMetric(consumerWaterfall, "Cost of Revenue", "-$18.5B");
  await expectWaterfallMetric(consumerWaterfall, "Gross Profit", "$28.6B");
  await expectWaterfallMetric(consumerWaterfall, "Operating Profit", "$14.6B");
  await expectWaterfallMetric(consumerWaterfall, "Other Income / Cost", "-$1.1B");
  await expectWaterfallMetric(consumerWaterfall, "Net Profits", "$11.0B");
});

async function expectWaterfallMetric(
  section: Locator,
  label: string,
  value: string,
) {
  const exactLabel = new RegExp(`^${escapeRegExp(label)}$`);
  const labelNode = section.locator(".waterfall-step-label").filter({
    hasText: exactLabel,
  });
  await expect(labelNode).toHaveCount(1);
  const metricCard = labelNode.locator("xpath=..");
  await expect(metricCard).toContainText(label);
  await expect(metricCard).toContainText(value);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
