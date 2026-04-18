import Link from "next/link";
import { notFound } from "next/navigation";
import { SUPPORTED_TICKERS } from "@/app/_lib/company-directory";
import { getCompanyWorkspaceData } from "@/app/_lib/company-workspace";

type DashboardPageProps = {
  params: Promise<{
    ticker: string;
  }>;
};

export function generateStaticParams() {
  return SUPPORTED_TICKERS.map((ticker) => ({ ticker }));
}

export default async function DashboardPage({
  params,
}: DashboardPageProps) {
  const { ticker } = await params;
  const company = await getCompanyWorkspaceData(ticker);

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
              <p className="stat-value">{company.currentPriceDisplay}</p>
              <p className="stat-copy">
                Current market pricing for the selected ticker.
              </p>
            </article>

            <article className="stat-card">
              <p className="stat-label">Market cap</p>
              <p className="stat-value">{company.marketCapDisplay}</p>
              <p className="stat-copy">Compact market value for quick context.</p>
            </article>
          </div>
        </section>
      </div>

      {company.quoteDetails.length > 0 ? (
        <section
          className="workspace-panel quote-snapshot-panel"
          aria-label="Yahoo Finance snapshot"
        >
          <div className="quote-snapshot-header">
            <div>
              <p className="panel-label">Yahoo Finance Snapshot</p>
              <h2>Live market details</h2>
            </div>
            <p className="panel-copy quote-snapshot-copy">
              Previous close, trading range, valuation, and event dates for the
              selected ticker.
            </p>
          </div>

          <dl className="quote-detail-grid">
            {company.quoteDetails.map((detail) => (
              <div className="quote-detail-card" key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {company.marketContexts.length > 0 ? (
        <section
          className="workspace-panel market-context-panel"
          aria-label="Market context"
        >
          <div className="market-context-header">
            <div>
              <p className="panel-label">Market Context</p>
              <h2>Company price against its market backdrop</h2>
            </div>
            <p className="panel-copy market-context-copy">
              Compare the selected company against the broad market and a
              sector-relevant benchmark chosen from its reported sector.
            </p>
          </div>

          <div className="market-context-grid">
            <article className="market-context-card market-context-card-company">
              <p className="market-context-symbol">{company.ticker}</p>
              <p className="market-context-label">Company price</p>
              <p className="market-context-value">{company.currentPriceDisplay}</p>
              <p className="market-context-description">
                Current quote for the selected company workspace.
              </p>
            </article>

            {company.marketContexts.map((context) => (
              <article className="market-context-card" key={context.symbol}>
                <div className="market-context-card-header">
                  <p className="market-context-symbol">{context.symbol}</p>
                  <p className="market-context-change">{context.dailyChange}</p>
                </div>
                <p className="market-context-label">{context.label}</p>
                <p className="market-context-value">{context.value}</p>
                <p className="market-context-description">{context.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <Link className="back-link" href="/">
        Search another ticker
      </Link>
    </main>
  );
}
