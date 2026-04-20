export type QuoteDetail = {
  readonly label: string;
  readonly value: string;
};

export type IncomeStatementWaterfallStep = {
  readonly label: string;
  readonly value: number;
  readonly displayValue: string;
  readonly stepType: "total" | "delta";
};

export type RevenueSegment = {
  readonly label: string;
  readonly value: number;
  readonly displayValue: string;
  readonly shareOfTotal: number;
};

export type RevenueSegmentBreakdown = {
  readonly totalRevenue: number;
  readonly totalRevenueDisplay: string;
  readonly segments: readonly RevenueSegment[];
};

export type FinancialBridgePeriod = {
  readonly periodKey: "year" | "quarter";
  readonly label: string;
  readonly periodLabel: string;
  readonly dateRangeLabel: string;
  readonly incomeStatementWaterfall: readonly IncomeStatementWaterfallStep[];
  readonly revenueSegmentBreakdown: RevenueSegmentBreakdown | null;
};

export type PerformancePoint = {
  readonly label: string;
  readonly value: number;
};

export type PerformanceSeries = {
  readonly label: string;
  readonly symbol: string;
  readonly currentValue: string;
  readonly dailyChange: string;
  readonly lineColor: string;
  readonly points: readonly PerformancePoint[];
};

export type PerformanceChartRange = {
  readonly rangeKey: string;
  readonly label: string;
  readonly series: readonly PerformanceSeries[];
};

export type MarketContextCard = {
  readonly label: string;
  readonly symbol: string;
  readonly value: string;
  readonly dailyChange: string;
  readonly description: string;
};

export type CompanyWorkspaceData = {
  readonly ticker: string;
  readonly name: string;
  readonly sector: string;
  readonly summary: string;
  readonly workspaceTagline: string;
  readonly currentPriceDisplay: string;
  readonly marketCapDisplay: string;
  readonly incomeStatementWaterfall: readonly IncomeStatementWaterfallStep[];
  readonly revenueSegmentBreakdown: RevenueSegmentBreakdown | null;
  readonly financialBridgePeriods: readonly FinancialBridgePeriod[];
  readonly quoteDetails: readonly QuoteDetail[];
  readonly marketContexts: readonly MarketContextCard[];
  readonly performanceChartRanges: readonly PerformanceChartRange[];
};

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

export async function getCompanyWorkspaceData(
  ticker: string,
): Promise<CompanyWorkspaceData | null> {
  const normalizedTicker = ticker.toUpperCase();

  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/companies/${encodeURIComponent(normalizedTicker)}/workspace`,
      { cache: "no-store" },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Workspace request failed with ${response.status}`);
    }

    const payload = (await response.json()) as {
      ticker: string;
      name: string;
      sector: string;
      summary: string;
      workspace_tagline: string;
      current_price_display: string;
      market_cap_display: string;
      income_statement_waterfall: {
        label: string;
        value: number;
        display_value: string;
        step_type: "total" | "delta";
      }[];
      revenue_segment_breakdown: {
        total_revenue: number;
        total_revenue_display: string;
        segments: {
          label: string;
          value: number;
          display_value: string;
          share_of_total: number;
        }[];
      } | null;
      financial_bridge_periods?: {
        period_key: "year" | "quarter";
        label: string;
        period_label: string;
        date_range_label: string;
        income_statement_waterfall: {
          label: string;
          value: number;
          display_value: string;
          step_type: "total" | "delta";
        }[];
        revenue_segment_breakdown: {
          total_revenue: number;
          total_revenue_display: string;
          segments: {
            label: string;
            value: number;
            display_value: string;
            share_of_total: number;
          }[];
        } | null;
      }[];
      quote_details: QuoteDetail[];
      market_contexts: {
        label: string;
        symbol: string;
        value: string;
        daily_change: string;
        description: string;
      }[];
      performance_chart_ranges: {
        range_key: string;
        label: string;
        series: {
          label: string;
          symbol: string;
          current_value: string;
          daily_change: string;
          line_color: string;
          points: {
            label: string;
            value: number;
          }[];
        }[];
      }[];
    };
    const payloadFinancialBridgePeriods = payload.financial_bridge_periods?.map((period) => ({
      periodKey: period.period_key,
      label: period.label,
      periodLabel: period.period_label,
      dateRangeLabel: period.date_range_label,
      incomeStatementWaterfall: period.income_statement_waterfall.map((step) => ({
        label: step.label,
        value: step.value,
        displayValue: step.display_value,
        stepType: step.step_type,
      })),
      revenueSegmentBreakdown: period.revenue_segment_breakdown
        ? {
            totalRevenue: period.revenue_segment_breakdown.total_revenue,
            totalRevenueDisplay:
              period.revenue_segment_breakdown.total_revenue_display,
            segments: period.revenue_segment_breakdown.segments.map((segment) => ({
              label: segment.label,
              value: segment.value,
              displayValue: segment.display_value,
              shareOfTotal: segment.share_of_total,
            })),
          }
        : null,
    }));
    const financialBridgePeriods =
      payloadFinancialBridgePeriods && payloadFinancialBridgePeriods.length > 0
        ? payloadFinancialBridgePeriods
        : buildLegacyFinancialBridgePeriods(payload);
    const defaultFinancialBridgePeriod =
      financialBridgePeriods.find((period) => period.periodKey === "year") ??
      financialBridgePeriods[0];

    return {
      ticker: payload.ticker,
      name: payload.name,
      sector: payload.sector,
      summary: payload.summary,
      workspaceTagline: payload.workspace_tagline,
      currentPriceDisplay: payload.current_price_display,
      marketCapDisplay: payload.market_cap_display,
      incomeStatementWaterfall:
        defaultFinancialBridgePeriod?.incomeStatementWaterfall ??
        payload.income_statement_waterfall.map((step) => ({
          label: step.label,
          value: step.value,
          displayValue: step.display_value,
          stepType: step.step_type,
        })),
      revenueSegmentBreakdown:
        (payload.revenue_segment_breakdown
          ? {
              totalRevenue: payload.revenue_segment_breakdown.total_revenue,
              totalRevenueDisplay: payload.revenue_segment_breakdown.total_revenue_display,
              segments: payload.revenue_segment_breakdown.segments.map((segment) => ({
                label: segment.label,
                value: segment.value,
                displayValue: segment.display_value,
                shareOfTotal: segment.share_of_total,
              })),
            }
          : defaultFinancialBridgePeriod?.revenueSegmentBreakdown ?? null),
      financialBridgePeriods,
      quoteDetails: payload.quote_details,
      marketContexts: payload.market_contexts.map((context) => ({
        label: context.label,
        symbol: context.symbol,
        value: context.value,
        dailyChange: context.daily_change,
        description: context.description,
      })),
      performanceChartRanges: payload.performance_chart_ranges.map((range) => ({
        rangeKey: range.range_key,
        label: range.label,
        series: range.series.map((series) => ({
          label: series.label,
          symbol: series.symbol,
          currentValue: series.current_value,
          dailyChange: series.daily_change,
          lineColor: series.line_color,
          points: series.points,
        })),
      })),
    };
  } catch {
    return null;
  }
}

function buildLegacyFinancialBridgePeriods(payload: {
  income_statement_waterfall: {
    label: string;
    value: number;
    display_value: string;
    step_type: "total" | "delta";
  }[];
  revenue_segment_breakdown: {
    total_revenue: number;
    total_revenue_display: string;
    segments: {
      label: string;
      value: number;
      display_value: string;
      share_of_total: number;
    }[];
  } | null;
}): readonly FinancialBridgePeriod[] {
  if (
    payload.income_statement_waterfall.length === 0 &&
    payload.revenue_segment_breakdown === null
  ) {
    return [];
  }

  return [
    {
      periodKey: "year",
      label: "Year",
      periodLabel: "Latest annual period",
      dateRangeLabel: "Latest reported period",
      incomeStatementWaterfall: payload.income_statement_waterfall.map((step) => ({
        label: step.label,
        value: step.value,
        displayValue: step.display_value,
        stepType: step.step_type,
      })),
      revenueSegmentBreakdown: payload.revenue_segment_breakdown
        ? {
            totalRevenue: payload.revenue_segment_breakdown.total_revenue,
            totalRevenueDisplay: payload.revenue_segment_breakdown.total_revenue_display,
            segments: payload.revenue_segment_breakdown.segments.map((segment) => ({
              label: segment.label,
              value: segment.value,
              displayValue: segment.display_value,
              shareOfTotal: segment.share_of_total,
            })),
          }
        : null,
    },
  ];
}
