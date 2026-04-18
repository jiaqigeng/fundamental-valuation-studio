import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompanyProfile,
  SUPPORTED_TICKERS,
} from "@/app/_lib/company-directory";

type DashboardPageProps = {
  params: Promise<{
    ticker: string;
  }>;
};

export function generateStaticParams() {
  return SUPPORTED_TICKERS.map((ticker) => ({ ticker }));
}

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

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { ticker } = await params;
  const company = getCompanyProfile(ticker);

  if (!company) {
    notFound();
  }

  return (
    <main className="dashboard-shell">
      <div className="dashboard-hero">
        <div className="dashboard-hero-header">
          <div>
            <p className="eyebrow">Company Overview</p>
            <h1>{company.name}</h1>
          </div>
          <p className="ticker-pill">{company.ticker}</p>
        </div>
        <p className="hero-copy">{company.workspaceTagline}</p>
      </div>

      <div className="overview-grid">
        <section
          className="workspace-panel overview-card"
          aria-label={`${company.ticker} company overview`}
        >
          <div className="overview-header">
            <div>
              <p className="panel-label">Identity</p>
              <h2>{company.name}</h2>
            </div>
            <p className="overview-ticker">{company.ticker}</p>
          </div>

          <dl className="fact-list">
            <div className="fact-item">
              <dt>Sector</dt>
              <dd>{company.sector}</dd>
            </div>
          </dl>

          <p className="company-summary">{company.summary}</p>
        </section>

        <section className="workspace-panel stats-panel" aria-label="Key stats">
          <p className="panel-label">Key stats</p>
          <div className="stats-grid">
            <article className="stat-card">
              <p className="stat-label">Share price</p>
              <p className="stat-value">
                {priceFormatter.format(company.currentPrice)}
              </p>
              <p className="stat-copy">Seeded demo quote for the overview card.</p>
            </article>

            <article className="stat-card">
              <p className="stat-label">Market cap</p>
              <p className="stat-value">
                {marketCapFormatter.format(company.marketCap)}
              </p>
              <p className="stat-copy">Compact market value for quick context.</p>
            </article>
          </div>
        </section>
      </div>

      <Link className="back-link" href="/">
        Search another ticker
      </Link>
    </main>
  );
}
