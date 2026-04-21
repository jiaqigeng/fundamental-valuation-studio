export type DcfBaselineData = {
  readonly ticker: string;
  readonly companyName: string;
  readonly sector: string;
  readonly currentPrice: number | null;
  readonly currentPriceDisplay: string;
  readonly currentFreeCashFlow: number;
  readonly currentFreeCashFlowDisplay: string;
  readonly sharesOutstanding: number;
  readonly sharesOutstandingDisplay: string;
  readonly totalDebt: number;
  readonly totalDebtDisplay: string;
  readonly cashAndCashEquivalents: number;
  readonly cashAndCashEquivalentsDisplay: string;
  readonly riskFreeRate: number | null;
  readonly riskFreeRateDisplay: string;
  readonly beta: number | null;
  readonly betaDisplay: string;
  readonly assumptionNotes: readonly string[];
};

export type DcfValuationPayload = {
  readonly currentFreeCashFlow: number;
  readonly shortTermGrowthRate: number;
  readonly terminalGrowthRate: number;
  readonly equityRiskPremium: number;
  readonly riskFreeRate: number | null;
  readonly beta: number | null;
  readonly discountRate: number;
  readonly sharesOutstanding: number;
  readonly totalDebt: number;
  readonly cashAndCashEquivalents: number;
  readonly projectionYears: number;
};

export type DcfProjectionYear = {
  readonly year: number;
  readonly freeCashFlow: number;
  readonly presentValue: number;
};

export type DcfValuationResult = {
  readonly projections: readonly DcfProjectionYear[];
  readonly capmCostOfEquity: number | null;
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
      current_free_cash_flow: payload.currentFreeCashFlow,
      short_term_growth_rate: payload.shortTermGrowthRate,
      terminal_growth_rate: payload.terminalGrowthRate,
      equity_risk_premium: payload.equityRiskPremium,
      risk_free_rate: payload.riskFreeRate,
      beta: payload.beta,
      discount_rate: payload.discountRate,
      shares_outstanding: payload.sharesOutstanding,
      total_debt: payload.totalDebt,
      cash_and_cash_equivalents: payload.cashAndCashEquivalents,
      projection_years: payload.projectionYears,
    }),
  });

  if (!response.ok) {
    throw new Error(`DCF valuation request failed with ${response.status}`);
  }

  const responsePayload = (await response.json()) as BackendDcfValuationResult;
  return mapDcfValuationResponse(responsePayload);
}

export function mapDcfValuationResponse(
  payload: BackendDcfValuationResult,
): DcfValuationResult {
  return {
    projections: payload.projections.map((projection) => ({
      year: projection.year,
      freeCashFlow: projection.free_cash_flow,
      presentValue: projection.present_value,
    })),
    capmCostOfEquity: payload.capm_cost_of_equity,
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
  current_free_cash_flow: number;
  current_free_cash_flow_display: string;
  shares_outstanding: number;
  shares_outstanding_display: string;
  total_debt: number;
  total_debt_display: string;
  cash_and_cash_equivalents: number;
  cash_and_cash_equivalents_display: string;
  risk_free_rate: number | null;
  risk_free_rate_display: string;
  beta: number | null;
  beta_display: string;
  assumption_notes: string[];
};

type BackendDcfValuationResult = {
  projections: {
    year: number;
    free_cash_flow: number;
    present_value: number;
  }[];
  capm_cost_of_equity: number | null;
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
    currentFreeCashFlow: payload.current_free_cash_flow,
    currentFreeCashFlowDisplay: payload.current_free_cash_flow_display,
    sharesOutstanding: payload.shares_outstanding,
    sharesOutstandingDisplay: payload.shares_outstanding_display,
    totalDebt: payload.total_debt,
    totalDebtDisplay: payload.total_debt_display,
    cashAndCashEquivalents: payload.cash_and_cash_equivalents,
    cashAndCashEquivalentsDisplay: payload.cash_and_cash_equivalents_display,
    riskFreeRate: payload.risk_free_rate,
    riskFreeRateDisplay: payload.risk_free_rate_display,
    beta: payload.beta,
    betaDisplay: payload.beta_display,
    assumptionNotes: payload.assumption_notes,
  };
}
