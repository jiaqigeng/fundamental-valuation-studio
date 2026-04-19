import type { PerformanceSeries } from "@/app/_lib/company-workspace";

type PerformanceComparisonChartProps = {
  readonly series: readonly PerformanceSeries[];
};

const CHART_WIDTH = 860;
const CHART_HEIGHT = 320;
const CHART_PADDING = {
  top: 22,
  right: 18,
  bottom: 34,
  left: 48,
};

export function PerformanceComparisonChart({
  series,
}: PerformanceComparisonChartProps) {
  if (series.length === 0) {
    return null;
  }

  const pointCount = Math.max(...series.map((entry) => entry.points.length));
  const values = series.flatMap((entry) => entry.points.map((point) => point.value));
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const paddedMin = minValue - range * 0.08;
  const paddedMax = maxValue + range * 0.08;
  const paddedRange = paddedMax - paddedMin;
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const xForIndex = (index: number) => {
    if (pointCount <= 1) {
      return CHART_PADDING.left + plotWidth / 2;
    }
    return CHART_PADDING.left + (plotWidth * index) / (pointCount - 1);
  };

  const yForValue = (value: number) =>
    CHART_PADDING.top + ((paddedMax - value) / paddedRange) * plotHeight;

  const yAxisLabels = Array.from({ length: 5 }, (_, index) => {
    const labelValue = paddedMax - (paddedRange * index) / 4;
    return {
      value: labelValue.toFixed(0),
      y: yForValue(labelValue),
    };
  });

  const xAxisLabels = series[0]?.points.filter((_, index, points) => {
    return (
      index === 0 ||
      index === points.length - 1 ||
      index === Math.floor((points.length - 1) / 2)
    );
  });

  const baselineY = yForValue(100);

  return (
    <div className="comparison-chart-shell">
      <div className="comparison-chart-copy-row">
        <p className="comparison-chart-copy">
          All three lines start at 100 so relative growth is directly comparable.
        </p>
      </div>

      <svg
        aria-label="Normalized comparison chart"
        className="comparison-chart"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        role="img"
      >
        <rect
          x="0"
          y="0"
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          rx="18"
          className="comparison-chart-frame"
        />

        {yAxisLabels.map((label) => (
          <g key={label.value}>
            <line
              x1={CHART_PADDING.left}
              x2={CHART_WIDTH - CHART_PADDING.right}
              y1={label.y}
              y2={label.y}
              className="comparison-chart-gridline"
            />
            <text
              x={CHART_PADDING.left - 10}
              y={label.y + 4}
              className="comparison-chart-axis-label"
              textAnchor="end"
            >
              {label.value}
            </text>
          </g>
        ))}

        <line
          x1={CHART_PADDING.left}
          x2={CHART_WIDTH - CHART_PADDING.right}
          y1={baselineY}
          y2={baselineY}
          className="comparison-chart-baseline"
        />

        {series.map((entry) => {
          const path = entry.points
            .map((point, index) => {
              const command = index === 0 ? "M" : "L";
              return `${command}${xForIndex(index)} ${yForValue(point.value)}`;
            })
            .join(" ");

          return (
            <g key={entry.symbol}>
              <path
                d={path}
                fill="none"
                stroke={entry.lineColor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3.5"
              />
              {entry.points.map((point, index) => (
                <circle
                  key={`${entry.symbol}-${point.label}`}
                  cx={xForIndex(index)}
                  cy={yForValue(point.value)}
                  fill={entry.lineColor}
                  r="3.2"
                />
              ))}
            </g>
          );
        })}

        {xAxisLabels?.map((point) => {
          const index = series[0].points.findIndex((entry) => entry.label === point.label);
          return (
            <text
              key={point.label}
              x={xForIndex(index)}
              y={CHART_HEIGHT - 10}
              className="comparison-chart-axis-label"
              textAnchor="middle"
            >
              {point.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
