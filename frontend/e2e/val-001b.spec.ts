import { expect, test } from "@playwright/test";

test("val-001b shows a yfinance-backed DCF calculator and recomputes from user assumptions", async ({
  page,
}) => {
  await page.goto("/valuation?ticker=AAPL");

  const dcfCalculator = page.locator('section[aria-label="Discounted cash flow"]');

  await expect(dcfCalculator).toBeVisible();
  await expect(page.getByText(/Apple Inc\./i)).toBeVisible();

  await expect(
    dcfCalculator.getByText("Current Free Cash Flow", { exact: true }),
  ).toBeVisible();
  await expect(dcfCalculator.getByText("Total Cash", { exact: true })).toBeVisible();
  await expect(
    dcfCalculator.getByText("Shares Outstanding", { exact: true }),
  ).toBeVisible();
  await expect(dcfCalculator.getByText("Total Debt", { exact: true })).toBeVisible();
  await expect(
    dcfCalculator.getByText("Current Stock Price", { exact: true }),
  ).toBeVisible();

  const shortTermGrowthInput =
    dcfCalculator.getByLabel(/short-term growth rate/i);
  const terminalGrowthInput = dcfCalculator.getByLabel(/terminal growth rate/i);
  const discountRateInput =
    dcfCalculator.getByLabel(/discount rate \/ wacc/i);
  const projectionHorizon = dcfCalculator.getByLabel(/project years/i);

  await expect(shortTermGrowthInput).toHaveValue("");
  await expect(terminalGrowthInput).toHaveValue("");
  await expect(discountRateInput).toHaveValue("");
  await expect(projectionHorizon).toHaveValue("5");

  await shortTermGrowthInput.fill("8");
  await terminalGrowthInput.fill("3");
  await discountRateInput.fill("10");

  await dcfCalculator
    .getByRole("button", { name: /calculate intrinsic value/i })
    .click();

  const intrinsicValue = dcfCalculator.getByTestId("intrinsic-value-per-share");
  await expect(intrinsicValue).not.toHaveText(/Awaiting assumptions/i);
  await expect(page.getByText(/projected cash flows/i)).toBeVisible();
  await expect(dcfCalculator.locator("tbody tr")).toHaveCount(5);

  await projectionHorizon.selectOption("10");
  await dcfCalculator
    .getByRole("button", { name: /calculate intrinsic value/i })
    .click();

  await expect(dcfCalculator.locator("tbody tr")).toHaveCount(10);
});
