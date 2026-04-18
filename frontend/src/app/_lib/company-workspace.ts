import { getCompanyProfile } from "@/app/_lib/company-directory";

export type QuoteDetail = {
  readonly label: string;
  readonly value: string;
};

export type CompanyWorkspaceData = {
  readonly ticker: string;
  readonly name: string;
  readonly sector: string;
  readonly summary: string;
  readonly workspaceTagline: string;
  readonly currentPriceDisplay: string;
  readonly marketCapDisplay: string;
  readonly quoteDetails: readonly QuoteDetail[];
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
      quote_details: QuoteDetail[];
    };

    return {
      ticker: payload.ticker,
      name: payload.name,
      sector: payload.sector,
      summary: payload.summary,
      workspaceTagline: payload.workspace_tagline,
      currentPriceDisplay: payload.current_price_display,
      marketCapDisplay: payload.market_cap_display,
      quoteDetails: payload.quote_details,
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
    quoteDetails: [],
  };
}
