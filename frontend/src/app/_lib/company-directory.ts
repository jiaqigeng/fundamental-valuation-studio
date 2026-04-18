export type CompanyProfile = {
  readonly ticker: string;
  readonly name: string;
  readonly sector: string;
  readonly currentPrice: number;
  readonly marketCap: number;
  readonly summary: string;
  readonly workspaceTagline: string;
};

export const COMPANY_DIRECTORY: Record<string, CompanyProfile> = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    currentPrice: 212.48,
    marketCap: 3_200_000_000_000,
    summary:
      "Apple designs consumer electronics, software, and services across the iPhone, Mac, iPad, wearables, and a growing installed-base ecosystem.",
    workspaceTagline:
      "Seeded company overview ready for deeper context, valuation work, and AI analysis.",
  },
  KO: {
    ticker: "KO",
    name: "The Coca-Cola Company",
    sector: "Consumer Staples",
    currentPrice: 62.15,
    marketCap: 267_000_000_000,
    summary:
      "Coca-Cola is a global beverage company anchored by sparkling soft drinks, juices, water, coffee, and a wide bottling and distribution network.",
    workspaceTagline:
      "Seeded company overview ready for deeper context, valuation work, and AI analysis.",
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology",
    currentPrice: 423.73,
    marketCap: 3_150_000_000_000,
    summary:
      "Microsoft operates productivity, cloud, infrastructure, gaming, and AI platforms that span enterprise software, Azure, and consumer services.",
    workspaceTagline:
      "Seeded company overview ready for deeper context, valuation work, and AI analysis.",
  },
};

export const SUPPORTED_TICKERS = Object.keys(COMPANY_DIRECTORY);

export function getCompanyProfile(ticker: string): CompanyProfile | null {
  return COMPANY_DIRECTORY[ticker.toUpperCase()] ?? null;
}
