"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import type {
  DcfBaselineData,
  DcfValuationPayload,
  DcfValuationResult,
} from "@/app/_lib/valuation";
import { mapDcfValuationResponse } from "@/app/_lib/valuation";

type DcfCalculatorPanelProps = {
  readonly activeTicker: string;
  readonly baseline: DcfBaselineData;
};

type DcfFormState = {
  readonly shortTermGrowthRate: string;
  readonly terminalGrowthRate: string;
  readonly discountRate: string;
  readonly projectionYears: string;
};

type BackendDcfValuationResult = {
  projections: {
    year: number;
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

const FETCHED_METRICS: Array<{
  readonly label: string;
  readonly valueKey:
    | "currentFreeCashFlowDisplay"
    | "totalCashDisplay"
    | "totalDebtDisplay"
    | "sharesOutstandingDisplay"
    | "currentPriceDisplay";
  readonly tone: "blue" | "teal" | "gold";
}> = [
  {
    label: "Current Free Cash Flow",
    valueKey: "currentFreeCashFlowDisplay",
    tone: "blue",
  },
  {
    label: "Total Cash",
    valueKey: "totalCashDisplay",
    tone: "teal",
  },
  {
    label: "Total Debt",
    valueKey: "totalDebtDisplay",
    tone: "gold",
  },
  {
    label: "Shares Outstanding",
    valueKey: "sharesOutstandingDisplay",
    tone: "blue",
  },
  {
    label: "Current Stock Price",
    valueKey: "currentPriceDisplay",
    tone: "teal",
  },
];

export function DcfCalculatorPanel({
  activeTicker,
  baseline,
}: DcfCalculatorPanelProps) {
  const [formState, setFormState] = useState<DcfFormState>({
    shortTermGrowthRate: "",
    terminalGrowthRate: "",
    discountRate: "",
    projectionYears: "5",
  });
  const [result, setResult] = useState<DcfValuationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const valuationGap =
    result && baseline.currentPrice && baseline.currentPrice > 0
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
        "Enter valid growth and discount assumptions before recalculating.",
      );
      return;
    }

    if (payload.terminalGrowthRate >= payload.discountRate) {
      setErrorMessage("Terminal growth must stay below the discount rate.");
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
            current_free_cash_flow: payload.currentFreeCashFlow,
            short_term_growth_rate: payload.shortTermGrowthRate,
            terminal_growth_rate: payload.terminalGrowthRate,
            discount_rate: payload.discountRate,
            shares_outstanding: payload.sharesOutstanding,
            total_debt: payload.totalDebt,
            cash_and_cash_equivalents: payload.totalCash,
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
      aria-label="Discounted cash flow"
      aria-labelledby="dcf-calculator-heading"
      className="workspace-panel valuation-workbench-shell"
    >
      <div className="valuation-workbench-hero">
        <div className="valuation-workbench-actions">
          <Link className="back-link valuation-workbench-link" href="/">
            Back to home
          </Link>
          <Link
            className="valuation-secondary-link valuation-workbench-link"
            href={`/dashboard/${encodeURIComponent(activeTicker)}`}
          >
            Open {activeTicker} dashboard
          </Link>
        </div>
        <div className="valuation-workbench-hero-copy">
          <p className="panel-label">DCF Workbench</p>
          <h2 id="dcf-calculator-heading">
            {baseline.companyName} ({baseline.ticker})
          </h2>
        </div>
      </div>

      <div className="valuation-workbench-layout">
        <section className="valuation-fetched-panel" aria-label="Fetched company inputs">
          <div className="financial-bridge-subsection-header">
            <h3>Fetched company inputs</h3>
            <p className="financial-bridge-period-status">
              Live values from yfinance
            </p>
          </div>
          <div className="valuation-fetched-grid">
            {FETCHED_METRICS.map((metric) => (
              <article
                key={metric.label}
                className={`valuation-fetched-card valuation-fetched-card-${metric.tone}`}
              >
                <p>{metric.label}</p>
                <strong>{baseline[metric.valueKey]}</strong>
              </article>
            ))}
          </div>
        </section>

        <form
          className="valuation-assumptions-panel"
          onSubmit={handleSubmit}
          aria-label="DCF assumptions"
        >
          <div className="financial-bridge-subsection-header">
            <h3>Assumptions</h3>
            <p className="financial-bridge-period-status">
              Keep the model focused on growth and discounting
            </p>
          </div>
          <div className="valuation-assumptions-grid">
            <label className="valuation-field">
              <span>Short-Term Growth Rate (%)</span>
              <input
                aria-label="Short-Term Growth Rate"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.shortTermGrowthRate}
                onChange={(event) =>
                  updateField("shortTermGrowthRate", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>Terminal Growth Rate (%)</span>
              <input
                aria-label="Terminal Growth Rate"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.terminalGrowthRate}
                onChange={(event) =>
                  updateField("terminalGrowthRate", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>Discount Rate / WACC (%)</span>
              <input
                aria-label="Discount Rate / WACC"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.discountRate}
                onChange={(event) =>
                  updateField("discountRate", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>Project Years</span>
              <select
                aria-label="Project Years"
                value={formState.projectionYears}
                onChange={(event) =>
                  updateField("projectionYears", event.target.value)
                }
              >
                <option value="5">5 years</option>
                <option value="10">10 years</option>
              </select>
            </label>
          </div>
          <button
            className="ticker-search-button valuation-submit-button"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Recalculating..." : "Calculate intrinsic value"}
          </button>
          {errorMessage ? (
            <p className="ticker-search-error" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </form>

        <section className="valuation-results-panel" aria-label="DCF results">
          <div className="financial-bridge-subsection-header">
            <h3>Output</h3>
            <p className="financial-bridge-period-status">
              Core value signals only
            </p>
          </div>
          <div className="valuation-results-grid valuation-results-grid-compact">
            <article className="valuation-result-card valuation-result-card-primary">
              <p>Estimated intrinsic value</p>
              <strong data-testid="intrinsic-value-per-share">
                {result
                  ? formatCurrency(result.intrinsicValuePerShare)
                  : "Awaiting assumptions"}
              </strong>
            </article>
            <article className="valuation-result-card">
              <p>Current stock price</p>
              <strong>{baseline.currentPriceDisplay}</strong>
            </article>
            <article className="valuation-result-card">
              <p>Upside / downside</p>
              <strong className={getValuationGapClassName(valuationGap, result)}>
                {result ? formatSignedPercent(valuationGap) : "Awaiting assumptions"}
              </strong>
            </article>
          </div>
        </section>
      </div>

      <section
        className="valuation-projection-shell"
        aria-label="DCF projections"
      >
        <div className="financial-bridge-subsection-header">
          <h3>Projected cash flows</h3>
          <p className="financial-bridge-period-status">
            {formState.projectionYears}-year explicit forecast
          </p>
        </div>
        <div className="valuation-projection-table-wrap">
          <table className="valuation-projection-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Free Cash Flow</th>
                <th>Present Value</th>
              </tr>
            </thead>
            <tbody>
              {result ? (
                result.projections.map((projection) => (
                  <tr key={projection.year}>
                    <td>{projection.year}</td>
                    <td>{formatCompactCurrency(projection.freeCashFlow)}</td>
                    <td>{formatCompactCurrency(projection.presentValue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>
                    Enter the four assumptions above to generate the cash-flow path.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function buildPayload(
  formState: DcfFormState,
  baseline: DcfBaselineData,
): DcfValuationPayload | null {
  const shortTermGrowthRate = parseInputNumber(formState.shortTermGrowthRate);
  const terminalGrowthRate = parseInputNumber(formState.terminalGrowthRate);
  const discountRate = parseInputNumber(formState.discountRate);
  const projectionYears = parseProjectionYears(formState.projectionYears);

  if (
    shortTermGrowthRate === null ||
    terminalGrowthRate === null ||
    discountRate === null ||
    projectionYears === null
  ) {
    return null;
  }

  return {
    currentFreeCashFlow: baseline.currentFreeCashFlow,
    shortTermGrowthRate: shortTermGrowthRate / 100,
    terminalGrowthRate: terminalGrowthRate / 100,
    discountRate: discountRate / 100,
    sharesOutstanding: baseline.sharesOutstanding,
    totalDebt: baseline.totalDebt,
    totalCash: baseline.totalCash,
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

function parseProjectionYears(value: string): number | null {
  if (value === "5" || value === "10") {
    return Number(value);
  }
  return null;
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
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    signDisplay: "always",
    maximumFractionDigits: 1,
  }).format(value);
}

function getValuationGapClassName(
  valuationGap: number | null,
  result: DcfValuationResult | null,
): string | undefined {
  if (result === null || valuationGap === null || Number.isNaN(valuationGap)) {
    return undefined;
  }

  if (valuationGap > 0) {
    return "valuation-trend-up";
  }

  if (valuationGap < 0) {
    return "valuation-trend-down";
  }

  return undefined;
}
