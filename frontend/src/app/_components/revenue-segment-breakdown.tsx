import type { RevenueSegmentBreakdown } from "@/app/_lib/company-workspace";

type RevenueSegmentBreakdownSectionProps = {
  readonly breakdown: RevenueSegmentBreakdown;
};

const SEGMENT_COLORS = [
  "#21409A",
  "#0F766E",
  "#C48A2C",
  "#B34234",
  "#5A6F2B",
  "#6C4BA3",
] as const;

const CHART_SIZE = 236;
const CHART_STROKE = 34;
const CHART_RADIUS = (CHART_SIZE - CHART_STROKE) / 2;
const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function RevenueSegmentBreakdownSection({
  breakdown,
}: RevenueSegmentBreakdownSectionProps) {
  const isSingleSegment = breakdown.segments.length === 1;
  const chartSegments = breakdown.segments.map((segment, index) => ({
    ...segment,
    color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
  }));
  const chartSlices = chartSegments.reduce<
    ReadonlyArray<
      (typeof chartSegments)[number] & {
        readonly dashLength: number;
        readonly dashGap: number;
        readonly dashOffset: number;
      }
    >
  >((slices, segment) => {
    const priorShare = slices.reduce((sum, slice) => sum + slice.shareOfTotal, 0);
    const dashLength =
      segment.shareOfTotal >= 1
        ? CHART_CIRCUMFERENCE
        : CHART_CIRCUMFERENCE * segment.shareOfTotal;

    return [
      ...slices,
      {
        ...segment,
        dashLength,
        dashGap: Math.max(CHART_CIRCUMFERENCE - dashLength, 0),
        dashOffset: -CHART_CIRCUMFERENCE * priorShare,
      },
    ];
  }, []);

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

      <div className="segment-breakdown-visual">
        <div className="segment-breakdown-chart-shell">
          <svg
            aria-label="Revenue segment pie chart"
            className="segment-breakdown-chart"
            role="img"
            viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
          >
            <circle
              cx={CHART_SIZE / 2}
              cy={CHART_SIZE / 2}
              r={CHART_RADIUS}
              className="segment-breakdown-chart-track"
            />

            {chartSlices.map((segment) => {
              return (
                <circle
                  key={segment.label}
                  cx={CHART_SIZE / 2}
                  cy={CHART_SIZE / 2}
                  r={CHART_RADIUS}
                  className="segment-breakdown-slice"
                  stroke={segment.color}
                  strokeDasharray={`${segment.dashLength} ${segment.dashGap}`}
                  strokeDashoffset={segment.dashOffset}
                />
              );
            })}
          </svg>

          <div className="segment-breakdown-chart-center">
            <span>Revenue</span>
            <strong>{breakdown.totalRevenueDisplay}</strong>
          </div>
        </div>

        <div className="segment-breakdown-list" role="list">
          {chartSegments.map((segment) => (
            <article className="segment-breakdown-row" key={segment.label} role="listitem">
              <div className="segment-breakdown-row-header">
                <div className="segment-breakdown-row-title">
                  <span
                    aria-hidden="true"
                    className="segment-breakdown-swatch"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div>
                    <p className="segment-breakdown-label">{segment.label}</p>
                    <p className="segment-breakdown-share">
                      {percentFormatter.format(segment.shareOfTotal)}
                    </p>
                  </div>
                </div>
                <p className="segment-breakdown-value">{segment.displayValue}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <p className="segment-breakdown-footnote">
        {isSingleSegment
          ? `The single reported segment equals total revenue at ${breakdown.totalRevenueDisplay}.`
          : `Pie slices reconcile to total revenue: ${breakdown.totalRevenueDisplay}.`}
      </p>
    </div>
  );
}
