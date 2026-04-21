export type DcfBaselineData = {
  readonly ticker: string;
  readonly companyName: string;
  readonly sector: string;
  readonly currentPrice: number | null;
  readonly currentPriceDisplay: string;
  readonly currentRevenue: number;
  readonly currentRevenueDisplay: string;
  readonly revenueGrowthRate: number;
  readonly operatingMargin: number;
  readonly taxRate: number;
  readonly salesToCapitalRatio: number;
  readonly wacc: number;
  readonly terminalGrowthRate: number;
  readonly sharesOutstanding: number;
  readonly sharesOutstandingDisplay: string;
  readonly netDebt: number;
  readonly netDebtDisplay: string;
  readonly projectionYears: number;
  readonly assumptionNotes: readonly string[];
};

export type DcfValuationPayload = {
  readonly currentRevenue: number;
  readonly revenueGrowthRate: number;
  readonly operatingMargin: number;
  readonly taxRate: number;
  readonly salesToCapitalRatio: number;
  readonly wacc: number;
  readonly terminalGrowthRate: number;
  readonly sharesOutstanding: number;
  readonly netDebt: number;
  readonly projectionYears: number;
};

export type DcfProjectionYear = {
  readonly year: number;
  readonly revenue: number;
  readonly operatingIncome: number;
  readonly nopat: number;
  readonly reinvestment: number;
  readonly freeCashFlow: number;
  readonly presentValue: number;
};

export type DcfValuationResult = {
  readonly projections: readonly DcfProjectionYear[];
  readonly terminalFreeCashFlow: number;
  readonly terminalValue: number;
  readonly terminalPresentValue: number;
  readonly enterpriseValue: number;
  readonly equityValue: number;
  readonly intrinsicValuePerShare: number;
};

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

export async function getDcfBaselineData(
  ticker: string,
): Promise<DcfBaselineData | null> {
  const normalizedTicker = ticker.trim().toUpperCase();

  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/valuations/dcf/${encodeURIComponent(normalizedTicker)}/baseline`,
      { cache: "no-store" },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`DCF baseline request failed with ${response.status}`);
    }

    const payload = (await response.json()) as BackendDcfBaselineData;
    return mapDcfBaseline(payload);
  } catch {
    return null;
  }
}

export async function calculateDcfValuation(
  payload: DcfValuationPayload,
): Promise<DcfValuationResult> {
  const response = await fetch(`${BACKEND_BASE_URL}/valuations/dcf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      current_revenue: payload.currentRevenue,
      revenue_growth_rate: payload.revenueGrowthRate,
      operating_margin: payload.operatingMargin,
      tax_rate: payload.taxRate,
      sales_to_capital_ratio: payload.salesToCapitalRatio,
      wacc: payload.wacc,
      terminal_growth_rate: payload.terminalGrowthRate,
      shares_outstanding: payload.sharesOutstanding,
      net_debt: payload.netDebt,
      projection_years: payload.projectionYears,
    }),
  });

  if (!response.ok) {
    throw new Error(`DCF valuation request failed with ${response.status}`);
  }

  const responsePayload = (await response.json()) as BackendDcfValuationResult;
  return mapDcfValuationResponse(responsePayload);
}

export function buildDcfPayloadFromBaseline(
  baseline: DcfBaselineData,
): DcfValuationPayload {
  return {
    currentRevenue: baseline.currentRevenue,
    revenueGrowthRate: baseline.revenueGrowthRate,
    operatingMargin: baseline.operatingMargin,
    taxRate: baseline.taxRate,
    salesToCapitalRatio: baseline.salesToCapitalRatio,
    wacc: baseline.wacc,
    terminalGrowthRate: baseline.terminalGrowthRate,
    sharesOutstanding: baseline.sharesOutstanding,
    netDebt: baseline.netDebt,
    projectionYears: baseline.projectionYears,
  };
}

export function mapDcfValuationResponse(
  payload: BackendDcfValuationResult,
): DcfValuationResult {
  return {
    projections: payload.projections.map((projection) => ({
      year: projection.year,
      revenue: projection.revenue,
      operatingIncome: projection.operating_income,
      nopat: projection.nopat,
      reinvestment: projection.reinvestment,
      freeCashFlow: projection.free_cash_flow,
      presentValue: projection.present_value,
    })),
    terminalFreeCashFlow: payload.terminal_free_cash_flow,
    terminalValue: payload.terminal_value,
    terminalPresentValue: payload.terminal_present_value,
    enterpriseValue: payload.enterprise_value,
    equityValue: payload.equity_value,
    intrinsicValuePerShare: payload.intrinsic_value_per_share,
  };
}

type BackendDcfBaselineData = {
  ticker: string;
  company_name: string;
  sector: string;
  current_price: number | null;
  current_price_display: string;
  current_revenue: number;
  current_revenue_display: string;
  revenue_growth_rate: number;
  operating_margin: number;
  tax_rate: number;
  sales_to_capital_ratio: number;
  wacc: number;
  terminal_growth_rate: number;
  shares_outstanding: number;
  shares_outstanding_display: string;
  net_debt: number;
  net_debt_display: string;
  projection_years: number;
  assumption_notes: string[];
};

type BackendDcfValuationResult = {
  projections: {
    year: number;
    revenue: number;
    operating_income: number;
    nopat: number;
    reinvestment: number;
    free_cash_flow: number;
    present_value: number;
  }[];
  terminal_free_cash_flow: number;
  terminal_value: number;
  terminal_present_value: number;
  enterprise_value: number;
  equity_value: number;
  intrinsic_value_per_share: number;
};

function mapDcfBaseline(payload: BackendDcfBaselineData): DcfBaselineData {
  return {
    ticker: payload.ticker,
    companyName: payload.company_name,
    sector: payload.sector,
    currentPrice: payload.current_price,
    currentPriceDisplay: payload.current_price_display,
    currentRevenue: payload.current_revenue,
    currentRevenueDisplay: payload.current_revenue_display,
    revenueGrowthRate: payload.revenue_growth_rate,
    operatingMargin: payload.operating_margin,
    taxRate: payload.tax_rate,
    salesToCapitalRatio: payload.sales_to_capital_ratio,
    wacc: payload.wacc,
    terminalGrowthRate: payload.terminal_growth_rate,
    sharesOutstanding: payload.shares_outstanding,
    sharesOutstandingDisplay: payload.shares_outstanding_display,
    netDebt: payload.net_debt,
    netDebtDisplay: payload.net_debt_display,
    projectionYears: payload.projection_years,
    assumptionNotes: payload.assumption_notes,
  };
}
