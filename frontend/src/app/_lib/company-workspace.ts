import { getCompanyProfile } from "@/app/_lib/company-directory";

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
  readonly quoteDetails: readonly QuoteDetail[];
  readonly marketContexts: readonly MarketContextCard[];
  readonly performanceChartRanges: readonly PerformanceChartRange[];
};

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const marketCapFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

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
      return buildFallbackWorkspace(normalizedTicker);
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

    return {
      ticker: payload.ticker,
      name: payload.name,
      sector: payload.sector,
      summary: payload.summary,
      workspaceTagline: payload.workspace_tagline,
      currentPriceDisplay: payload.current_price_display,
      marketCapDisplay: payload.market_cap_display,
      incomeStatementWaterfall: payload.income_statement_waterfall.map((step) => ({
        label: step.label,
        value: step.value,
        displayValue: step.display_value,
        stepType: step.step_type,
      })),
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
    return buildFallbackWorkspace(normalizedTicker);
  }
}

function buildFallbackWorkspace(ticker: string): CompanyWorkspaceData | null {
  const company = getCompanyProfile(ticker);

  if (!company) {
    return null;
  }

  return {
    ticker: company.ticker,
    name: company.name,
    sector: company.sector,
    summary: company.summary,
    workspaceTagline: company.workspaceTagline,
    currentPriceDisplay: priceFormatter.format(company.currentPrice),
    marketCapDisplay: marketCapFormatter.format(company.marketCap),
    incomeStatementWaterfall: [],
    quoteDetails: [],
    marketContexts: [],
    performanceChartRanges: [],
  };
}
