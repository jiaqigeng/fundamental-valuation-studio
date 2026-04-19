import type { RevenueSegmentBreakdown } from "@/app/_lib/company-workspace";

type RevenueSegmentBreakdownSectionProps = {
  readonly breakdown: RevenueSegmentBreakdown;
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function RevenueSegmentBreakdownSection({
  breakdown,
}: RevenueSegmentBreakdownSectionProps) {
  const isSingleSegment = breakdown.segments.length === 1;

  return (
    <div className="segment-breakdown-shell">
      <div className="segment-breakdown-copy-row">
        <p className="segment-breakdown-copy">
          {isSingleSegment
            ? "This company currently reports revenue through a single segment, so the full total sits in one bucket."
            : "These reported segments reconcile directly to total revenue, making the business mix easy to compare at a glance."}
        </p>
        <div className="segment-breakdown-total-pill">
          <span>Total revenue</span>
          <strong>{breakdown.totalRevenueDisplay}</strong>
        </div>
      </div>

      <div className="segment-breakdown-list" role="list">
        {breakdown.segments.map((segment) => (
          <article className="segment-breakdown-row" key={segment.label} role="listitem">
            <div className="segment-breakdown-row-header">
              <div>
                <p className="segment-breakdown-label">{segment.label}</p>
                <p className="segment-breakdown-share">
                  {percentFormatter.format(segment.shareOfTotal)}
                </p>
              </div>
              <p className="segment-breakdown-value">{segment.displayValue}</p>
            </div>

            <div aria-hidden="true" className="segment-breakdown-track">
              <div
                className="segment-breakdown-fill"
                style={{
                  width: `${Math.max(segment.shareOfTotal * 100, isSingleSegment ? 100 : 12)}%`,
                }}
              />
            </div>
          </article>
        ))}
      </div>

      <p className="segment-breakdown-footnote">
        Reconciles to total revenue: {breakdown.totalRevenueDisplay}.
      </p>
    </div>
  );
}
