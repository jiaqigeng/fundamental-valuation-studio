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
  await expect(snapshot.getByText(/debt to equity/i)).toBeVisible();
  await expect(snapshot.getByText("32.11")).toBeVisible();
  await expect(snapshot.getByText(/beta \(5y monthly\)/i)).toBeVisible();
  await expect(snapshot.getByText("1.13")).toBeVisible();
  await expect(snapshot.getByText(/return on equity \(roe\)/i)).toBeVisible();
  await expect(snapshot.getByText("33.74%")).toBeVisible();
  await expect(snapshot.getByText(/return on assets \(roa\)/i)).toBeVisible();
  await expect(snapshot.getByText("14.95%")).toBeVisible();
  await expect(snapshot.getByText(/forward dividend & yield/i)).toBeVisible();
  await expect(snapshot.getByText("3.64 (0.86%)")).toBeVisible();
  await expect(snapshot.getByText(/avg\. volume/i)).toBeVisible();
  await expect(snapshot.getByText("32,964,050")).toBeVisible();
  await expect(snapshot.getByText(/trailing dividend/i)).toBeVisible();
  await expect(snapshot.getByText("3.32")).toBeVisible();
  await expect(snapshot.getByText(/earnings date/i)).toBeVisible();
  await expect(snapshot.getByText("Apr 29, 2026")).toBeVisible();
  await expect(snapshot.getByText(/ex-dividend date/i)).toBeVisible();
  await expect(snapshot.getByText("Mar 9, 2026")).toBeVisible();

  await expect(snapshot.getByText("Previous Close", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Open", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Bid", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Dividend Date", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Profit Margin", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Operating Margin", { exact: true })).toHaveCount(0);
  await expect(snapshot.getByText("Free Cash Flow", { exact: true })).toHaveCount(0);
});
