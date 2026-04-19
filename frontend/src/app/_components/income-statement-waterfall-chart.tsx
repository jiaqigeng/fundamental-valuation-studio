import type { IncomeStatementWaterfallStep } from "@/app/_lib/company-workspace";

type IncomeStatementWaterfallChartProps = {
  readonly steps: readonly IncomeStatementWaterfallStep[];
};

type WaterfallBar = {
  readonly step: IncomeStatementWaterfallStep;
  readonly start: number;
  readonly end: number;
  readonly lower: number;
  readonly upper: number;
};

const CHART_WIDTH = 860;
const CHART_HEIGHT = 360;
const CHART_PADDING = {
  top: 26,
  right: 20,
  bottom: 46,
  left: 72,
};

const axisFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function IncomeStatementWaterfallChart({
  steps,
}: IncomeStatementWaterfallChartProps) {
  if (steps.length === 0) {
    return null;
  }

  const bars = buildBars(steps);
  const chartValues = [0, ...bars.flatMap((bar) => [bar.start, bar.end])];
  const minValue = Math.min(...chartValues);
  const maxValue = Math.max(...chartValues);
  const range = Math.max(maxValue - minValue, 1);
  const paddedMin = minValue - range * 0.12;
  const paddedMax = maxValue + range * 0.12;
  const paddedRange = paddedMax - paddedMin;
  const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const barWidth = Math.min(84, (plotWidth / steps.length) * 0.62);

  const xForIndex = (index: number) =>
    CHART_PADDING.left + (plotWidth * (index + 0.5)) / steps.length;

  const yForValue = (value: number) =>
    CHART_PADDING.top + ((paddedMax - value) / paddedRange) * plotHeight;

  const yAxisLabels = Array.from({ length: 5 }, (_, index) => {
    const value = paddedMax - (paddedRange * index) / 4;
    return {
      value,
      y: yForValue(value),
    };
  });

  return (
    <div className="waterfall-chart-shell">
      <p className="waterfall-chart-copy">
        Starting from revenue, the chart now surfaces gross profit and operating
        profit as subtotal checkpoints before bridging through other income or cost
        and taxes to net profits.
      </p>

      <svg
        aria-label="Revenue to net income waterfall chart"
        className="waterfall-chart"
        role="img"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        <rect
          x="0"
          y="0"
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          rx="18"
          className="waterfall-chart-frame"
        />

        {yAxisLabels.map((label) => (
          <g key={`${label.value}`}>
            <line
              x1={CHART_PADDING.left}
              x2={CHART_WIDTH - CHART_PADDING.right}
              y1={label.y}
              y2={label.y}
              className="waterfall-chart-gridline"
            />
            <text
              x={CHART_PADDING.left - 12}
              y={label.y + 4}
              className="waterfall-chart-axis-label"
              textAnchor="end"
            >
              {axisFormatter.format(label.value)}
            </text>
          </g>
        ))}

        <line
          x1={CHART_PADDING.left}
          x2={CHART_WIDTH - CHART_PADDING.right}
          y1={yForValue(0)}
          y2={yForValue(0)}
          className="waterfall-chart-baseline"
        />

        {bars.map((bar, index) => {
          const previousBar = bars[index - 1];
          const rawHeight = yForValue(bar.lower) - yForValue(bar.upper);
          const barHeight = Math.max(rawHeight, 3);
          const barY = rawHeight < 3 ? yForValue(bar.upper) - 1.5 : yForValue(bar.upper);
          const x = xForIndex(index) - barWidth / 2;
          const toneClass =
            bar.step.stepType === "total"
              ? "waterfall-bar-total"
              : bar.step.value >= 0
                ? "waterfall-bar-positive"
                : "waterfall-bar-negative";

          return (
            <g key={bar.step.label}>
              {previousBar && bar.step.stepType === "delta" ? (
                <line
                  x1={xForIndex(index - 1) + barWidth / 2}
                  x2={xForIndex(index) - barWidth / 2}
                  y1={yForValue(bar.start)}
                  y2={yForValue(bar.start)}
                  className="waterfall-chart-connector"
                />
              ) : null}

              <rect
                x={x}
                y={barY}
                width={barWidth}
                height={barHeight}
                rx="10"
                className={toneClass}
              />

              <text
                x={xForIndex(index)}
                y={CHART_HEIGHT - 16}
                className="waterfall-chart-axis-label"
                textAnchor="middle"
              >
                {bar.step.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="waterfall-step-grid">
        {steps.map((step) => {
          const toneClass =
            step.stepType === "total"
              ? "waterfall-step-value-total"
              : step.value >= 0
                ? "waterfall-step-value-positive"
                : "waterfall-step-value-negative";

          return (
            <article className="waterfall-step-card" key={step.label}>
              <p className="waterfall-step-label">{step.label}</p>
              <p className={`waterfall-step-value ${toneClass}`}>{step.displayValue}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function buildBars(
  steps: readonly IncomeStatementWaterfallStep[],
): readonly WaterfallBar[] {
  let runningTotal = 0;

  return steps.map((step) => {
    if (step.stepType === "total") {
      runningTotal = step.value;
      return {
        step,
        start: 0,
        end: step.value,
        lower: Math.min(0, step.value),
        upper: Math.max(0, step.value),
      };
    }

    const start = runningTotal;
    const end = runningTotal + step.value;
    runningTotal = end;

    return {
      step,
      start,
      end,
      lower: Math.min(start, end),
      upper: Math.max(start, end),
    };
  });
}
