"use client";

import { useState } from "react";
import { IncomeStatementWaterfallChart } from "@/app/_components/income-statement-waterfall-chart";
import { RevenueSegmentBreakdownSection } from "@/app/_components/revenue-segment-breakdown";
import type { RevenueSegmentBreakdown } from "@/app/_lib/company-workspace";
import type { FinancialBridgePeriod } from "@/app/_lib/company-workspace";

type FinancialBridgeSectionProps = {
  readonly annualBreakdown: RevenueSegmentBreakdown | null;
  readonly periods: readonly FinancialBridgePeriod[];
};

export function FinancialBridgeSection({
  annualBreakdown,
  periods,
}: FinancialBridgeSectionProps) {
  const annualPeriod =
    periods.find((period) => period.periodKey === "year") ?? periods[0] ?? null;
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(
    periods.find((period) => period.periodKey === "year")?.periodKey ??
      periods[0]?.periodKey ??
      "",
  );

  const selectedPeriod =
    periods.find((period) => period.periodKey === selectedPeriodKey) ?? periods[0];

  if (!selectedPeriod) {
    return null;
  }

  return (
    <section className="workspace-panel financial-bridge-card" aria-label="Revenue breakdown and profit bridge">
      <div className="financial-bridge-copy-row">
        <p className="financial-bridge-copy">
          The segment pie stays anchored to the latest reported annual mix, while
          the waterfall can switch between yearly and quarterly reported periods.
        </p>
      </div>

      {annualBreakdown ? (
        <section
          className="financial-bridge-subsection"
          aria-label="Revenue segment breakdown"
        >
          <div className="financial-bridge-subsection-header">
            <p className="panel-label">Revenue Breakdown By Segments</p>
            <h3>Revenue breakdown by segments</h3>
            {annualPeriod ? (
              <p className="financial-bridge-period-status">
                {annualPeriod.periodLabel} · {annualPeriod.dateRangeLabel}
              </p>
            ) : null}
          </div>
          <RevenueSegmentBreakdownSection
            breakdown={annualBreakdown}
          />
        </section>
      ) : null}

      {selectedPeriod.incomeStatementWaterfall.length > 0 ? (
        <section
          className="financial-bridge-subsection"
          aria-label="Revenue to net income waterfall"
        >
          <div className="financial-bridge-subsection-header">
            <div className="financial-bridge-waterfall-header-row">
              <div>
                <p className="panel-label">Revenue To Profits Waterfall Bridge</p>
                <h3>Revenue to profits waterfall bridge</h3>
              </div>
              {periods.length > 1 ? (
                <div className="financial-bridge-period-picker" role="group" aria-label="Waterfall period">
                  {periods.map((period) => {
                    const isActive = period.periodKey === selectedPeriod.periodKey;

                    return (
                      <button
                        key={period.periodKey}
                        type="button"
                        className={`financial-bridge-period-button${isActive ? " financial-bridge-period-button-active" : ""}`}
                        aria-pressed={isActive}
                        onClick={() => setSelectedPeriodKey(period.periodKey)}
                      >
                        {period.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <p className="financial-bridge-period-status">
              {selectedPeriod.periodLabel} · {selectedPeriod.dateRangeLabel}
            </p>
          </div>
          <IncomeStatementWaterfallChart
            steps={selectedPeriod.incomeStatementWaterfall}
          />
        </section>
      ) : null}
    </section>
  );
}
