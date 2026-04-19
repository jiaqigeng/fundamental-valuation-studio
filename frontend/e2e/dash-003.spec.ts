import { expect, test } from "@playwright/test";

test("dash-003 shows broad-market and sector-relevant context that updates by company", async ({
  page,
}) => {
  await page.goto("/dashboard/AAPL");

  const marketContext = page.getByRole("region", {
    name: /market context/i,
  });

  await expect(marketContext).toBeVisible();
  await expect(
    marketContext.getByLabel("Normalized comparison chart"),
  ).toBeVisible();
  await expect(
    marketContext.getByRole("button", { name: "1Y" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    marketContext.getByRole("button", { name: "5Y" }),
  ).toBeVisible();
  await expect(
    marketContext.getByText("Showing 1 year normalized performance.", { exact: true }),
  ).toBeVisible();
  await expect(marketContext.getByText("AAPL", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("S&P 500", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("^GSPC", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("$212.48")).toBeVisible();
  await expect(marketContext.getByText("7,126.06")).toBeVisible();
  await expect(marketContext.getByText("+84.78 (+1.20%)")).toBeVisible();
  await expect(
    marketContext.getByText("Technology sector benchmark", { exact: true }),
  ).toBeVisible();
  await expect(marketContext.getByText("XLK", { exact: true })).toBeVisible();
  await expect(marketContext.getByText("154.35")).toBeVisible();
  await expect(marketContext.getByText("+2.33 (+1.53%)")).toBeVisible();
  await expect(marketContext.getByText("May 2025", { exact: true })).toBeVisible();

  await marketContext.getByRole("button", { name: "5Y" }).click();

  await expect(
    marketContext.getByRole("button", { name: "5Y" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    marketContext.getByText("Showing 5 year normalized performance.", { exact: true }),
  ).toBeVisible();
  await expect(marketContext.getByText("Apr 2021", { exact: true })).toBeVisible();

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
  await expect(consumerContext.getByText("KO", { exact: true })).toBeVisible();
  await expect(consumerContext.getByText("$62.15")).toBeVisible();
  await expect(consumerContext.getByText("XLP", { exact: true })).toBeVisible();
  await expect(consumerContext.getByText("82.46")).toBeVisible();
  await expect(consumerContext.getByText("+1.03 (+1.26%)")).toBeVisible();
  await expect(
    consumerContext.getByRole("button", { name: "1Y" }),
  ).toHaveAttribute("aria-pressed", "true");
});
