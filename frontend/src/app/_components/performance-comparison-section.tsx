"use client";

import { useState } from "react";
import { PerformanceComparisonChart } from "@/app/_components/performance-comparison-chart";
import type { PerformanceSeries } from "@/app/_lib/company-workspace";
import type { PerformanceChartRange } from "@/app/_lib/company-workspace";

type PerformanceComparisonSectionProps = {
  readonly chartRanges: readonly PerformanceChartRange[];
};

export function PerformanceComparisonSection({
  chartRanges,
}: PerformanceComparisonSectionProps) {
  const [selectedRangeKey, setSelectedRangeKey] = useState(
    chartRanges[0]?.rangeKey ?? "",
  );

  const selectedRange =
    chartRanges.find((range) => range.rangeKey === selectedRangeKey) ?? chartRanges[0];

  if (!selectedRange) {
    return null;
  }

  return (
    <section className="workspace-panel" aria-label="Market context">
      <div className="comparison-chart-copy-row">
        <p className="comparison-chart-copy">
          All three lines start at 100 over the selected period so relative growth is
          directly comparable.
        </p>

        {chartRanges.length > 1 ? (
          <div className="comparison-chart-range-picker" role="group" aria-label="Comparison range">
            {chartRanges.map((range) => {
              const isActive = range.rangeKey === selectedRange.rangeKey;

              return (
                <button
                  key={range.rangeKey}
                  type="button"
                  className={`comparison-chart-range-button${isActive ? " comparison-chart-range-button-active" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setSelectedRangeKey(range.rangeKey)}
                >
                  {range.rangeKey}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <p className="comparison-chart-range-status">
        Showing {selectedRange.label} normalized performance.
      </p>

      <PerformanceComparisonChart series={selectedRange.series} />

      <div className="market-context-grid market-context-grid-legend">
        {selectedRange.series.map((series) => {
          const rangeReturn = getSelectedRangeReturn(series);

          return (
            <article
              className="market-context-card"
              key={`${selectedRange.rangeKey}-${series.symbol}`}
            >
              <div className="market-context-card-header">
                <div className="market-context-card-heading">
                  <span
                    aria-hidden="true"
                    className="market-context-swatch"
                    style={{ backgroundColor: series.lineColor }}
                  />
                  <p className="market-context-symbol">{series.symbol}</p>
                </div>
                <p
                  className={`market-context-change market-context-change-${rangeReturn.tone}`}
                >
                  {rangeReturn.display}
                </p>
              </div>
              <p className="market-context-label">{series.label}</p>
              <p className="market-context-value">{series.currentValue}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "always",
});

function getSelectedRangeReturn(series: PerformanceSeries): {
  readonly display: string;
  readonly tone: "positive" | "negative" | "neutral";
} {
  const firstPoint = series.points[0];
  const lastPoint = series.points[series.points.length - 1];

  if (!firstPoint || !lastPoint || firstPoint.value === 0) {
    return {
      display: "N/A",
      tone: "neutral",
    };
  }

  const percentReturn = ((lastPoint.value - firstPoint.value) / firstPoint.value) * 100;
  const tone =
    percentReturn > 0 ? "positive" : percentReturn < 0 ? "negative" : "neutral";

  return {
    display: `${percentFormatter.format(percentReturn)}%`,
    tone,
  };
}
