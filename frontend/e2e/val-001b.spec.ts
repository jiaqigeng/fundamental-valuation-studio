import { expect, test } from "@playwright/test";

test("val-001b shows a yfinance-backed DCF calculator and recomputes from user assumptions", async ({
  page,
}) => {
  await page.goto("/valuation?ticker=AAPL");

  const dcfCalculator = page.locator('section[aria-label="Discounted cash flow"]');

  await expect(dcfCalculator).toBeVisible();
  await expect(page.getByText(/Apple Inc\./i)).toBeVisible();

  await expect(
    dcfCalculator.getByText("Free Cashflow", { exact: true }),
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
  const projectionHorizon = dcfCalculator.getByRole("group", {
    name: /project years/i,
  });
  const fiveYearButton = projectionHorizon.getByRole("button", {
    name: /5 years/i,
  });
  const tenYearButton = projectionHorizon.getByRole("button", {
    name: /10 years/i,
  });

  await expect(shortTermGrowthInput).toHaveValue("");
  await expect(terminalGrowthInput).toHaveValue("");
  await expect(discountRateInput).toHaveValue("");
  await expect(fiveYearButton).toHaveAttribute("aria-pressed", "true");
  await expect(tenYearButton).toHaveAttribute("aria-pressed", "false");

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

  await tenYearButton.click();
  await dcfCalculator
    .getByRole("button", { name: /calculate intrinsic value/i })
    .click();

  await expect(fiveYearButton).toHaveAttribute("aria-pressed", "false");
  await expect(tenYearButton).toHaveAttribute("aria-pressed", "true");
  await expect(dcfCalculator.locator("tbody tr")).toHaveCount(10);
});
