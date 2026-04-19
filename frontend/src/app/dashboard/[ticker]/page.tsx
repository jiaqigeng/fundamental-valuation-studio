import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PerformanceComparisonChart } from "@/app/_components/performance-comparison-chart";
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

type ExpandableSectionProps = {
  readonly label: string;
  readonly title: string;
  readonly sectionClassName?: string;
  readonly children: ReactNode;
};

function ExpandableSection({
  label,
  title,
  sectionClassName,
  children,
}: ExpandableSectionProps) {
  return (
    <details className={`workspace-accordion ${sectionClassName ?? ""}`} open>
      <summary className="workspace-accordion-summary">
        <div>
          <p className="panel-label">{label}</p>
          <h2>{title}</h2>
        </div>
        <span className="workspace-accordion-toggle" aria-hidden="true" />
      </summary>
      <div className="workspace-accordion-body">{children}</div>
    </details>
  );
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

      <ExpandableSection
        label="Company Overview"
        title={`${company.name} at a glance`}
        sectionClassName="overview-accordion"
      >
        <section
          className="workspace-panel overview-card"
          aria-label={`${company.ticker} company overview`}
        >
          <dl className="overview-meta-grid">
            <div className="fact-item">
              <dt>Ticker</dt>
              <dd>{company.ticker}</dd>
            </div>
            <div className="fact-item">
              <dt>Sector</dt>
              <dd>{company.sector}</dd>
            </div>
            <div className="fact-item">
              <dt>Share price</dt>
              <dd>{company.currentPriceDisplay}</dd>
            </div>
            <div className="fact-item">
              <dt>Market cap</dt>
              <dd>{company.marketCapDisplay}</dd>
            </div>
          </dl>

          <div className="overview-summary-block">
            <p className="panel-label">Business Summary</p>
            <p className="company-summary">{company.summary}</p>
          </div>
        </section>
      </ExpandableSection>

      {company.quoteDetails.length > 0 ? (
        <ExpandableSection
          label="Yahoo Finance Snapshot"
          title="Live market details"
          sectionClassName="quote-snapshot-panel"
        >
          <section className="workspace-panel" aria-label="Yahoo Finance snapshot">
            <dl className="quote-detail-grid">
              {company.quoteDetails.map((detail) => (
                <div className="quote-detail-card" key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </ExpandableSection>
      ) : null}

      {company.performanceChart.length > 0 ? (
        <ExpandableSection
          label="Market Context"
          title="Normalized growth comparison"
          sectionClassName="market-context-panel"
        >
          <section className="workspace-panel" aria-label="Market context">
            <PerformanceComparisonChart series={company.performanceChart} />

            <div className="market-context-grid market-context-grid-legend">
              {company.performanceChart.map((series) => (
                <article className="market-context-card" key={series.symbol}>
                  <div className="market-context-card-header">
                    <div className="market-context-card-heading">
                      <span
                        aria-hidden="true"
                        className="market-context-swatch"
                        style={{ backgroundColor: series.lineColor }}
                      />
                      <p className="market-context-symbol">{series.symbol}</p>
                    </div>
                    <p className="market-context-change">{series.dailyChange}</p>
                  </div>
                  <p className="market-context-label">{series.label}</p>
                  <p className="market-context-value">{series.currentValue}</p>
                </article>
              ))}
            </div>
          </section>
        </ExpandableSection>
      ) : null}

      <Link className="back-link" href="/">
        Search another ticker
      </Link>
    </main>
  );
}
