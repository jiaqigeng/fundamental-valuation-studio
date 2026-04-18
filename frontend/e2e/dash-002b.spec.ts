import { expect, test } from "@playwright/test";

test("dash-002b shows a Yahoo Finance quote snapshot for the workspace", async ({
  page,
}) => {
  await page.goto("/dashboard/MSFT");

  const snapshot = page.getByRole("region", {
    name: /yahoo finance snapshot/i,
  });

  await expect(snapshot).toBeVisible();
  await expect(snapshot.getByText("Previous Close", { exact: true })).toBeVisible();
  await expect(snapshot.getByText("336.02")).toBeVisible();
  await expect(snapshot.getByText("Open", { exact: true })).toBeVisible();
  await expect(snapshot.getByText("337.73")).toBeVisible();
  await expect(snapshot.getByText("Bid", { exact: true })).toBeVisible();
  await expect(snapshot.getByText("320.66 x 100")).toBeVisible();
  await expect(snapshot.getByText(/market cap \(intraday\)/i)).toBeVisible();
  await expect(snapshot.getByText("4.133T")).toBeVisible();
  await expect(snapshot.getByText(/pe ratio \(ttm\)/i)).toBeVisible();
  await expect(snapshot.getByText("31.64")).toBeVisible();
  await expect(snapshot.getByText(/eps \(ttm\)/i)).toBeVisible();
  await expect(snapshot.getByText("10.80")).toBeVisible();
  await expect(snapshot.getByText(/earnings date/i)).toBeVisible();
  await expect(snapshot.getByText("Apr 29, 2026")).toBeVisible();
  await expect(snapshot.getByText(/forward dividend & yield/i)).toBeVisible();
  await expect(snapshot.getByText("0.84 (0.25%)")).toBeVisible();
  await expect(snapshot.getByText(/ex-dividend date/i)).toBeVisible();
  await expect(snapshot.getByText("Mar 9, 2026")).toBeVisible();
});
