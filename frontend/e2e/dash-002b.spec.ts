import { expect, test } from "@playwright/test";

test("dash-002b shows a Yahoo Finance quote snapshot for the workspace", async ({
  page,
}) => {
  await page.goto("/dashboard/MSFT");

  const snapshot = page.getByRole("region", {
    name: /yahoo finance snapshot/i,
  });

  await expect(snapshot).toBeVisible();
  await expect(snapshot.getByText(/trailing p\/e/i)).toBeVisible();
  await expect(snapshot.getByText("31.64")).toBeVisible();
  await expect(snapshot.getByText(/forward p\/e/i)).toBeVisible();
  await expect(snapshot.getByText("28.10")).toBeVisible();
  await expect(snapshot.getByText(/price to book/i)).toBeVisible();
  await expect(snapshot.getByText("10.78")).toBeVisible();
  await expect(snapshot.getByText(/ev \/ ebitda/i)).toBeVisible();
  await expect(snapshot.getByText("20.45")).toBeVisible();
  await expect(snapshot.getByText(/ev \/ revenue/i)).toBeVisible();
  await expect(snapshot.getByText("12.88")).toBeVisible();
  await expect(snapshot.getByText(/peg ratio/i)).toBeVisible();
  await expect(snapshot.getByText("2.21")).toBeVisible();
  await expect(snapshot.getByText(/return on equity \(roe\)/i)).toBeVisible();
  await expect(snapshot.getByText("33.74%")).toBeVisible();
  await expect(snapshot.getByText(/return on assets \(roa\)/i)).toBeVisible();
  await expect(snapshot.getByText("14.95%")).toBeVisible();
  await expect(snapshot.getByText(/profit margin/i)).toBeVisible();
  await expect(snapshot.getByText("35.96%")).toBeVisible();
  await expect(snapshot.getByText(/operating margin/i)).toBeVisible();
  await expect(snapshot.getByText("44.64%")).toBeVisible();
  await expect(snapshot.getByText(/debt to equity/i)).toBeVisible();
  await expect(snapshot.getByText("32.11")).toBeVisible();
  await expect(snapshot.getByText(/beta \(5y monthly\)/i)).toBeVisible();
  await expect(snapshot.getByText("1.13")).toBeVisible();
  await expect(snapshot.getByText(/free cash flow/i)).toBeVisible();
  await expect(snapshot.getByText("$71.9B")).toBeVisible();
  await expect(snapshot.getByText(/earnings date/i)).toBeVisible();
  await expect(snapshot.getByText("Apr 29, 2026")).toBeVisible();
  await expect(snapshot.getByText(/ex-dividend date/i)).toBeVisible();
  await expect(snapshot.getByText("Mar 9, 2026")).toBeVisible();

  await expect(snapshot.getByText("Previous Close", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Open", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Bid", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Dividend Date", { exact: true })).toHaveCount(0);
});
