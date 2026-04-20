"use client";

import { useState } from "react";
import { IncomeStatementWaterfallChart } from "@/app/_components/income-statement-waterfall-chart";
import { RevenueSegmentBreakdownSection } from "@/app/_components/revenue-segment-breakdown";
import type { FinancialBridgePeriod } from "@/app/_lib/company-workspace";

type FinancialBridgeSectionProps = {
  readonly periods: readonly FinancialBridgePeriod[];
};

export function FinancialBridgeSection({
  periods,
}: FinancialBridgeSectionProps) {
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
          Switch between yearly and quarterly reported views. The segment mix and
          the waterfall stay aligned to the same reporting period.
        </p>

        {periods.length > 1 ? (
          <div className="financial-bridge-period-picker" role="group" aria-label="Revenue period">
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
        Showing {selectedPeriod.label.toLowerCase()} figures.
      </p>

      {selectedPeriod.revenueSegmentBreakdown ? (
        <section
          className="financial-bridge-subsection"
          aria-label="Revenue segment breakdown"
        >
          <div className="financial-bridge-subsection-header">
            <p className="panel-label">Revenue Breakdown By Segments</p>
            <h3>Revenue breakdown by segments</h3>
          </div>
          <RevenueSegmentBreakdownSection
            breakdown={selectedPeriod.revenueSegmentBreakdown}
          />
        </section>
      ) : null}

      {selectedPeriod.incomeStatementWaterfall.length > 0 ? (
        <section
          className="financial-bridge-subsection"
          aria-label="Revenue to net income waterfall"
        >
          <div className="financial-bridge-subsection-header">
            <p className="panel-label">Revenue To Profits Waterfall Bridge</p>
            <h3>Revenue to profits waterfall bridge</h3>
          </div>
          <IncomeStatementWaterfallChart
            steps={selectedPeriod.incomeStatementWaterfall}
          />
        </section>
      ) : null}
    </section>
  );
}
