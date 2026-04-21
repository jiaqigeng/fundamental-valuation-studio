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
};

type DcfFormState = {
  readonly shortTermGrowthRate: string;
  readonly terminalGrowthRate: string;
  readonly equityRiskPremium: string;
  readonly discountRate: string;
  readonly projectionYears: string;
};

type BackendDcfValuationResult = {
  projections: {
    year: number;
    free_cash_flow: number;
    present_value: number;
  }[];
  capm_cost_of_equity: number | null;
  terminal_free_cash_flow: number;
  terminal_value: number;
  terminal_present_value: number;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
};

export function DcfCalculatorPanel({ baseline }: DcfCalculatorPanelProps) {
  const [formState, setFormState] = useState<DcfFormState>({
    shortTermGrowthRate: "",
    terminalGrowthRate: "",
    equityRiskPremium: "",
    discountRate: "",
    projectionYears: "5",
  });
  const [result, setResult] = useState<DcfValuationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const capmPreview = buildCapmPreview(formState.equityRiskPremium, baseline);
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
        "Enter valid growth, equity risk premium, and discount-rate assumptions before recalculating.",
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
            equity_risk_premium: payload.equityRiskPremium,
            risk_free_rate: payload.riskFreeRate,
            beta: payload.beta,
            discount_rate: payload.discountRate,
            shares_outstanding: payload.sharesOutstanding,
            total_debt: payload.totalDebt,
            cash_and_cash_equivalents: payload.cashAndCashEquivalents,
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
            Company inputs come from yfinance; growth and discount assumptions
            come from you.
          </p>
        </div>
        <dl className="valuation-company-metrics">
          <div className="valuation-company-metric">
            <dt>Price</dt>
            <dd>{baseline.currentPriceDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Current free cash flow</dt>
            <dd>{baseline.currentFreeCashFlowDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Shares outstanding</dt>
            <dd>{baseline.sharesOutstandingDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Total debt</dt>
            <dd>{baseline.totalDebtDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Cash &amp; equivalents</dt>
            <dd>{baseline.cashAndCashEquivalentsDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Risk-free rate</dt>
            <dd>{baseline.riskFreeRateDisplay}</dd>
          </div>
          <div className="valuation-company-metric">
            <dt>Beta</dt>
            <dd>{baseline.betaDisplay}</dd>
          </div>
        </dl>
      </div>

      <div className="valuation-calculator-layout">
        <form className="valuation-form-grid" onSubmit={handleSubmit}>
          <div className="valuation-form-card">
            <h3>User assumptions</h3>
            <label className="valuation-field">
              <span>Short-term FCF growth (%)</span>
              <input
                aria-label="Short-term FCF growth"
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
            <label className="valuation-field">
              <span>Equity risk premium (%)</span>
              <input
                aria-label="Equity risk premium"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.equityRiskPremium}
                onChange={(event) =>
                  updateField("equityRiskPremium", event.target.value)
                }
              />
            </label>
            <label className="valuation-field">
              <span>WACC / discount rate (%)</span>
              <input
                aria-label="WACC / discount rate"
                inputMode="decimal"
                type="number"
                step="0.1"
                value={formState.discountRate}
                onChange={(event) =>
                  updateField("discountRate", event.target.value)
                }
              />
            </label>
          </div>

          <div className="valuation-form-card">
            <h3>Model settings</h3>
            <label className="valuation-field">
              <span>Projection horizon</span>
              <select
                aria-label="Projection horizon"
                value={formState.projectionYears}
                onChange={(event) =>
                  updateField("projectionYears", event.target.value)
                }
              >
                <option value="5">Years 1-5</option>
                <option value="10">Years 1-10</option>
              </select>
            </label>
            <div className="valuation-result-card">
              <p>CAPM cost of equity</p>
              <strong>{formatPercent(capmPreview)}</strong>
            </div>
            <p className="panel-copy">
              CAPM uses the fetched risk-free rate and beta with your equity risk
              premium as a reference point; the valuation still discounts with
              your chosen WACC / discount rate.
            </p>
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
                {result ? formatCurrency(result.intrinsicValuePerShare) : "Awaiting assumptions"}
              </strong>
            </article>
            <article className="valuation-result-card">
              <p>Price gap</p>
              <strong>{result ? formatSignedPercent(valuationGap) : "Awaiting assumptions"}</strong>
            </article>
            <article className="valuation-result-card">
              <p>Enterprise value</p>
              <strong>
                {result ? formatCompactCurrency(result.enterpriseValue) : "Awaiting assumptions"}
              </strong>
            </article>
            <article className="valuation-result-card">
              <p>Equity value</p>
              <strong>
                {result ? formatCompactCurrency(result.equityValue) : "Awaiting assumptions"}
              </strong>
            </article>
            <article className="valuation-result-card">
              <p>Terminal value</p>
              <strong>
                {result ? formatCompactCurrency(result.terminalValue) : "Awaiting assumptions"}
              </strong>
            </article>
            <article className="valuation-result-card">
              <p>Terminal FCF</p>
              <strong>
                {result
                  ? formatCompactCurrency(result.terminalFreeCashFlow)
                  : "Awaiting assumptions"}
              </strong>
            </article>
          </div>

          <section
            className="valuation-assumption-notes"
            aria-label="Assumption notes"
          >
            <h3>Fetched baseline</h3>
            <ul className="valuation-note-list">
              {baseline.assumptionNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        </div>
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
                <th>Free cash flow</th>
                <th>Present value</th>
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
                  <td colSpan={3}>Enter your assumptions to project cash flows.</td>
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
  const equityRiskPremium = parseInputNumber(formState.equityRiskPremium);
  const discountRate = parseInputNumber(formState.discountRate);
  const projectionYears = parseProjectionYears(formState.projectionYears);

  if (
    shortTermGrowthRate === null ||
    terminalGrowthRate === null ||
    equityRiskPremium === null ||
    discountRate === null ||
    projectionYears === null
  ) {
    return null;
  }

  return {
    currentFreeCashFlow: baseline.currentFreeCashFlow,
    shortTermGrowthRate: shortTermGrowthRate / 100,
    terminalGrowthRate: terminalGrowthRate / 100,
    equityRiskPremium: equityRiskPremium / 100,
    riskFreeRate: baseline.riskFreeRate,
    beta: baseline.beta,
    discountRate: discountRate / 100,
    sharesOutstanding: baseline.sharesOutstanding,
    totalDebt: baseline.totalDebt,
    cashAndCashEquivalents: baseline.cashAndCashEquivalents,
    projectionYears,
  };
}

function buildCapmPreview(
  equityRiskPremiumInput: string,
  baseline: DcfBaselineData,
): number | null {
  const equityRiskPremium = parseInputNumber(equityRiskPremiumInput);
  if (
    equityRiskPremium === null ||
    baseline.riskFreeRate === null ||
    baseline.beta === null
  ) {
    return null;
  }

  return baseline.riskFreeRate + baseline.beta * (equityRiskPremium / 100);
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

function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "N/A";
  }
  return new Intl.NumberFormat("en-US", {
    style: "percent",
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
