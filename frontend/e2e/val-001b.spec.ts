import { expect, test } from "@playwright/test";

test("val-001b shows a yfinance-backed DCF calculator and recomputes from user assumptions", async ({
  page,
}) => {
  await page.goto("/valuation?ticker=AAPL");

  const dcfCalculator = page.getByRole("region", {
    name: /discounted cash flow/i,
  });

  await expect(dcfCalculator).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /dividend discount model/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /residual income model/i }),
  ).toBeVisible();
  await expect(page.getByText(/Apple Inc\./i)).toBeVisible();

  await expect(
    dcfCalculator.getByText("Current free cash flow", { exact: true }),
  ).toBeVisible();
  await expect(
    dcfCalculator.getByText("Shares outstanding", { exact: true }),
  ).toBeVisible();
  await expect(dcfCalculator.getByText("Total debt", { exact: true })).toBeVisible();
  await expect(
    dcfCalculator.getByText("Cash & equivalents", { exact: true }),
  ).toBeVisible();
  await expect(
    dcfCalculator.getByText("Risk-free rate", { exact: true }),
  ).toBeVisible();
  await expect(dcfCalculator.getByText("Beta", { exact: true })).toBeVisible();

  const shortTermGrowthInput =
    dcfCalculator.getByLabel(/short-term fcf growth/i);
  const terminalGrowthInput = dcfCalculator.getByLabel(/terminal growth/i);
  const equityRiskPremiumInput =
    dcfCalculator.getByLabel(/equity risk premium/i);
  const discountRateInput =
    dcfCalculator.getByLabel(/wacc \/ discount rate/i);
  const projectionHorizon = dcfCalculator.getByLabel(/projection horizon/i);

  await expect(shortTermGrowthInput).toHaveValue("");
  await expect(terminalGrowthInput).toHaveValue("");
  await expect(equityRiskPremiumInput).toHaveValue("");
  await expect(discountRateInput).toHaveValue("");
  await expect(projectionHorizon).toHaveValue("5");

  await shortTermGrowthInput.fill("8");
  await terminalGrowthInput.fill("3");
  await equityRiskPremiumInput.fill("5");
  await discountRateInput.fill("10");

  await dcfCalculator
    .getByRole("button", { name: /recalculate valuation/i })
    .click();

  const intrinsicValue = dcfCalculator.getByTestId("intrinsic-value-per-share");
  await expect(intrinsicValue).not.toHaveText(/Awaiting assumptions/i);
  await expect(page.getByText(/projected cash flows/i)).toBeVisible();
  await expect(dcfCalculator.locator("tbody tr")).toHaveCount(5);

  await projectionHorizon.selectOption("10");
  await dcfCalculator
    .getByRole("button", { name: /recalculate valuation/i })
    .click();

  await expect(dcfCalculator.locator("tbody tr")).toHaveCount(10);
});
