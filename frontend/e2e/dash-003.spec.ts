import { expect, test } from "@playwright/test";

test("dash-003 shows broad-market and sector-relevant context that updates by company", async ({
  page,
}) => {
  await page.goto("/dashboard/AAPL");

  const marketContext = page.getByRole("region", {
    name: /market context/i,
  });

  await expect(marketContext).toBeVisible();
  await expect(marketContext.getByText("Company price", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("AAPL", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("S&P 500", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("^GSPC", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("7,126.06")).toBeVisible();
  await expect(marketContext.getByText("+84.78 (+1.20%)")).toBeVisible();
  await expect(
    marketContext.getByText("Technology sector benchmark", { exact: true }),
  ).toBeVisible();
  await expect(marketContext.getByText("XLK", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("154.35")).toBeVisible();
  await expect(marketContext.getByText("+2.33 (+1.53%)")).toBeVisible();

  await page.goto("/dashboard/KO");

  const consumerContext = page.getByRole("region", {
    name: /market context/i,
  });

  await expect(consumerContext).toBeVisible();
  await expect(
    consumerContext.getByText("Consumer Staples sector benchmark", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(consumerContext.getByText("XLP", { exact: true })).toBeVisible();
  await expect(consumerContext.getByText("82.46")).toBeVisible();
  await expect(consumerContext.getByText("+1.03 (+1.26%)")).toBeVisible();
});
