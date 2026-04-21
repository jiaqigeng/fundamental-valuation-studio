"use client";

import { useState, useTransition } from "react";

import type {
  DcfBaselineData,
  DcfValuationPayload,
  DcfValuationResult,
} from "@/app/_lib/valuation";
import { mapDcfValuationResponse } from "@/app/_lib/valuation";

type DcfCalculatorPanelProps = {
  readonly baseline: DcfBaselineData;
  readonly initialResult: DcfValuationResult;
};

type DcfFormState = {
  readonly revenueGrowthRate: string;
  readonly operatingMargin: string;
  readonly taxRate: string;
  readonly salesToCapitalRatio: string;
  readonly wacc: string;
  readonly terminalGrowthRate: string;
  readonly projectionYears: string;
};

export function DcfCalculatorPanel({
  baseline,
  initialResult,
}: DcfCalculatorPanelProps) {
  const [formState, setFormState] = useState<DcfFormState>({
    revenueGrowthRate: formatPercentInput(baseline.revenueGrowthRate),
    operatingMargin: formatPercentInput(baseline.operatingMargin),
    taxRate: formatPercentInput(baseline.taxRate),
    salesToCapitalRatio: baseline.salesToCapitalRatio.toFixed(1),
    wacc: formatPercentInput(baseline.wacc),
    terminalGrowthRate: formatPercentInput(baseline.terminalGrowthRate),
    projectionYears: `${baseline.projectionYears}`,
  });
  const [result, setResult] = useState(initialResult);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const valuationGap =
    baseline.currentPrice && baseline.currentPrice > 0
      ? result.intrinsicValuePerShare / baseline.currentPrice - 1
      : null;

  function updateField(field: keyof DcfFormState, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = buildPayload(formState, baseline);
    if (payload === null) {
      setErrorMessage(
        "Enter valid numeric assumptions before recalculating the DCF view.",
      );
      return;
    }

    if (payload.terminalGrowthRate >= payload.wacc) {
      setErrorMessage("Terminal growth must stay below WACC.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/valuations/dcf", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_revenue: payload.currentRevenue,
            revenue_growth_rate: payload.revenueGrowthRate,
            operating_margin: payload.operatingMargin,
            tax_rate: payload.taxRate,
            sales_to_capital_ratio: payload.salesToCapitalRatio,
            wacc: payload.wacc,
            terminal_growth_rate: payload.terminalGrowthRate,
            shares_outstanding: payload.sharesOutstanding,
            net_debt: payload.netDebt,
            projection_years: payload.projectionYears,
          }),
        });

        const responsePayload = (await response.json()) as
          | BackendDcfValuationResult
          | { detail?: string };

        if (!response.ok) {
          setErrorMessage(
            ("detail" in responsePayload ? responsePayload.detail : undefined) ??
              "We couldn't recalculate the DCF output right now.",
          );
          return;
        }

        if (!("projections" in responsePayload)) {
          setErrorMessage("We couldn't recalculate the DCF output right now.");
          return;
        }

        setResult(mapDcfValuationResponse(responsePayload));
      } catch {
        setErrorMessage("We couldn't recalculate the DCF output right now.");
      }
    });
  }

  return (
    <section
      aria-labelledby="dcf-calculator-heading"
      className="workspace-panel valuation-calculator-shell"
    >
      <div className="valuation-company-strip">
        <div>
          <p className="panel-label">Selected company</p>
          <h2 id="dcf-calculator-heading">Discounted cash flow</h2>
          <p className="valuation-company-copy">
            {baseline.companyName} ({baseline.ticker}) in {baseline.sector}.
            Inputs start from company data and stay fully editable once loaded.
          </p>
        </div>
        <dl className="valuation-company-metrics">
          <div className="valuation-company-metric">
            <dt>Price</dt>
            <dd>{baseline.currentPriceDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Revenue</dt>
            <dd>{baseline.currentRevenueDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Shares</dt>
            <dd>{baseline.sharesOutstandingDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Net debt</dt>
            <dd>{baseline.netDebtDisplay}</dd>
          </div>
        </dl>
      </div>

      <div className="valuation-calculator-layout">
        <form className="valuation-form-grid" onSubmit={handleSubmit}>
          <div className="valuation-form-card">
            <h3>Core assumptions</h3>
            <label className="valuation-field">
              <span>Revenue growth (%)</span>
              <input
                aria-label="Revenue growth"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.revenueGrowthRate}
                onChange={(event) =>
                  updateField("revenueGrowthRate", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>Operating margin (%)</span>
              <input
                aria-label="Operating margin"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.operatingMargin}
                onChange={(event) =>
                  updateField("operatingMargin", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>WACC (%)</span>
              <input
                aria-label="WACC"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.wacc}
                onChange={(event) => updateField("wacc", event.target.value)}
              />
            </label>
            <label className="valuation-field">
              <span>Terminal growth (%)</span>
              <input
                aria-label="Terminal growth"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.terminalGrowthRate}
                onChange={(event) =>
                  updateField("terminalGrowthRate", event.target.value)
                }
              />
            </label>
          </div>

          <div className="valuation-form-card">
            <h3>Model settings</h3>
            <label className="valuation-field">
              <span>Tax rate (%)</span>
              <input
                aria-label="Tax rate"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.taxRate}
                onChange={(event) => updateField("taxRate", event.target.value)}
              />
            </label>
            <label className="valuation-field">
              <span>Sales to capital ratio</span>
              <input
                aria-label="Sales to capital ratio"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.salesToCapitalRatio}
                onChange={(event) =>
                  updateField("salesToCapitalRatio", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>Projection years</span>
              <input
                aria-label="Projection years"
                inputMode="numeric"
                type="number"
                min={1}
                max={10}
                step={1}
                value={formState.projectionYears}
                onChange={(event) =>
                  updateField("projectionYears", event.target.value)
                }
              />
            </label>
            <button
              className="ticker-search-button valuation-submit-button"
              disabled={isPending}
              type="submit"
            >
              {isPending ? "Recalculating..." : "Recalculate valuation"}
            </button>
            {errorMessage ? (
              <p className="ticker-search-error" role="alert">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </form>

        <div className="valuation-results-shell">
          <div className="valuation-results-grid">
            <article className="valuation-result-card valuation-result-card-primary">
              <p>Intrinsic value per share</p>
              <strong data-testid="intrinsic-value-per-share">
                {formatCurrency(result.intrinsicValuePerShare)}
              </strong>
            </article>
            <article className="valuation-result-card">
              <p>Price gap</p>
              <strong>{formatSignedPercent(valuationGap)}</strong>
            </article>
            <article className="valuation-result-card">
              <p>Enterprise value</p>
              <strong>{formatCompactCurrency(result.enterpriseValue)}</strong>
            </article>
            <article className="valuation-result-card">
              <p>Equity value</p>
              <strong>{formatCompactCurrency(result.equityValue)}</strong>
            </article>
            <article className="valuation-result-card">
              <p>Terminal value</p>
              <strong>{formatCompactCurrency(result.terminalValue)}</strong>
            </article>
            <article className="valuation-result-card">
              <p>Terminal FCF</p>
              <strong>{formatCompactCurrency(result.terminalFreeCashFlow)}</strong>
            </article>
          </div>

          <section className="valuation-assumption-notes" aria-label="Assumption notes">
            <h3>Why these starting points</h3>
            <ul className="valuation-note-list">
              {baseline.assumptionNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="valuation-projection-shell" aria-label="DCF projections">
        <div className="financial-bridge-subsection-header">
          <h3>Projected cash flows</h3>
          <p className="financial-bridge-period-status">
            {baseline.projectionYears}-year explicit forecast
          </p>
        </div>
        <div className="valuation-projection-table-wrap">
          <table className="valuation-projection-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Revenue</th>
                <th>Operating income</th>
                <th>FCF</th>
                <th>Present value</th>
              </tr>
            </thead>
            <tbody>
              {result.projections.map((projection) => (
                <tr key={projection.year}>
                  <td>{projection.year}</td>
                  <td>{formatCompactCurrency(projection.revenue)}</td>
                  <td>{formatCompactCurrency(projection.operatingIncome)}</td>
                  <td>{formatCompactCurrency(projection.freeCashFlow)}</td>
                  <td>{formatCompactCurrency(projection.presentValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

type BackendDcfValuationResult = {
  projections: {
    year: number;
    revenue: number;
    operating_income: number;
    nopat: number;
    reinvestment: number;
    free_cash_flow: number;
    present_value: number;
  }[];
  terminal_free_cash_flow: number;
  terminal_value: number;
  terminal_present_value: number;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
};

function buildPayload(
  formState: DcfFormState,
  baseline: DcfBaselineData,
): DcfValuationPayload | null {
  const revenueGrowthRate = parseInputNumber(formState.revenueGrowthRate);
  const operatingMargin = parseInputNumber(formState.operatingMargin);
  const taxRate = parseInputNumber(formState.taxRate);
  const salesToCapitalRatio = parseInputNumber(formState.salesToCapitalRatio);
  const wacc = parseInputNumber(formState.wacc);
  const terminalGrowthRate = parseInputNumber(formState.terminalGrowthRate);
  const projectionYears = parseIntegerInput(formState.projectionYears);

  if (
    revenueGrowthRate === null ||
    operatingMargin === null ||
    taxRate === null ||
    salesToCapitalRatio === null ||
    wacc === null ||
    terminalGrowthRate === null ||
    projectionYears === null
  ) {
    return null;
  }

  return {
    currentRevenue: baseline.currentRevenue,
    revenueGrowthRate: revenueGrowthRate / 100,
    operatingMargin: operatingMargin / 100,
    taxRate: taxRate / 100,
    salesToCapitalRatio,
    wacc: wacc / 100,
    terminalGrowthRate: terminalGrowthRate / 100,
    sharesOutstanding: baseline.sharesOutstanding,
    netDebt: baseline.netDebt,
    projectionYears,
  };
}

function parseInputNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseIntegerInput(value: string): number | null {
  const parsed = parseInputNumber(value);
  if (parsed === null) {
    return null;
  }
  const rounded = Math.round(parsed);
  if (rounded < 1 || rounded > 10) {
    return null;
  }
  return rounded;
}

function formatPercentInput(value: number): string {
  return (value * 100).toFixed(1);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSignedPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  const formatted = new Intl.NumberFormat("en-US", {
    style: "percent",
    signDisplay: "always",
    maximumFractionDigits: 1,
  }).format(value);
  return formatted.replace("%", "%");
}
