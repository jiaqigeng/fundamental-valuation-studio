import { expect, test } from "@playwright/test";

test("val-001b shows a DCF calculator with prefilled assumptions and recomputes", async ({
  page,
}) => {
  await page.goto("/valuation");

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

  const revenueGrowthInput = dcfCalculator.getByLabel(/revenue growth/i);
  const operatingMarginInput = dcfCalculator.getByLabel(/operating margin/i);
  const waccInput = dcfCalculator.getByLabel(/^wacc$/i);
  const terminalGrowthInput = dcfCalculator.getByLabel(/terminal growth/i);

  await expect(revenueGrowthInput).toHaveValue("6.0");
  await expect(operatingMarginInput).toHaveValue("28.1");
  await expect(waccInput).toHaveValue("10.2");
  await expect(terminalGrowthInput).toHaveValue("3.0");

  const intrinsicValue = dcfCalculator.getByTestId("intrinsic-value-per-share");
  const initialIntrinsicValue = await intrinsicValue.textContent();

  await waccInput.fill("11.5");
  await dcfCalculator
    .getByRole("button", { name: /recalculate valuation/i })
    .click();

  await expect(intrinsicValue).toBeVisible();
  await expect(intrinsicValue).not.toHaveText(initialIntrinsicValue ?? "");

  await terminalGrowthInput.fill("2.5");
  await dcfCalculator
    .getByRole("button", { name: /recalculate valuation/i })
    .click();

  await expect(page.getByText(/projected cash flows/i)).toBeVisible();
  await expect(page.getByRole("cell", { name: "$414.5B" })).toBeVisible();
});
