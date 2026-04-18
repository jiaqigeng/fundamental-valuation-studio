export type CompanyProfile = {
  readonly ticker: string;
  readonly name: string;
  readonly workspaceTagline: string;
};

export const COMPANY_DIRECTORY: Record<string, CompanyProfile> = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    workspaceTagline:
      "Foundational dashboard workspace ready for company context, valuation, and AI analysis.",
  },
  KO: {
    ticker: "KO",
    name: "The Coca-Cola Company",
    workspaceTagline:
      "Foundational dashboard workspace ready for company context, valuation, and AI analysis.",
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    workspaceTagline:
      "Foundational dashboard workspace ready for company context, valuation, and AI analysis.",
  },
};

export const SUPPORTED_TICKERS = Object.keys(COMPANY_DIRECTORY);

export function getCompanyProfile(ticker: string): CompanyProfile | null {
  return COMPANY_DIRECTORY[ticker.toUpperCase()] ?? null;
}
