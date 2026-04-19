import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { IncomeStatementWaterfallChart } from "@/app/_components/income-statement-waterfall-chart";
import { PerformanceComparisonSection } from "@/app/_components/performance-comparison-section";
import { RevenueSegmentBreakdownSection } from "@/app/_components/revenue-segment-breakdown";
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
            <h1 className="dashboard-company-title">{company.name}</h1>
          </div>
          <Link className="back-link dashboard-back-link" href="/">
            Search another ticker
          </Link>
        </div>
      </div>

      <ExpandableSection
        label="Company Overview"
        title="Business summary and key stats"
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

      {company.revenueSegmentBreakdown || company.incomeStatementWaterfall.length > 0 ? (
        <ExpandableSection
          label="Income Statement Bridge"
          title="Revenue breakdown and profit bridge"
          sectionClassName="waterfall-panel financial-bridge-panel"
        >
          <section
            className="workspace-panel financial-bridge-card"
            aria-label="Revenue breakdown and profit bridge"
          >
            {company.revenueSegmentBreakdown ? (
              <section
                className="financial-bridge-subsection"
                aria-label="Revenue segment breakdown"
              >
                <div className="financial-bridge-subsection-header">
                  <p className="panel-label">Revenue Breakdown By Segments</p>
                  <h3>Revenue breakdown by segments</h3>
                </div>
                <RevenueSegmentBreakdownSection
                  breakdown={company.revenueSegmentBreakdown}
                />
              </section>
            ) : null}

            {company.incomeStatementWaterfall.length > 0 ? (
              <section
                className="financial-bridge-subsection"
                aria-label="Revenue to net income waterfall"
              >
                <div className="financial-bridge-subsection-header">
                  <p className="panel-label">Revenue To Profits Waterfall Bridge</p>
                  <h3>Revenue to profits waterfall bridge</h3>
                </div>
                <IncomeStatementWaterfallChart
                  steps={company.incomeStatementWaterfall}
                />
              </section>
            ) : null}
          </section>
        </ExpandableSection>
      ) : null}

      {company.quoteDetails.length > 0 ? (
        <ExpandableSection
          label="Yahoo Finance Snapshot"
          title="Valuation-relevant market details"
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

      {company.performanceChartRanges.length > 0 ? (
        <ExpandableSection
          label="Market Context"
          title="Normalized growth comparison"
          sectionClassName="market-context-panel"
        >
          <PerformanceComparisonSection chartRanges={company.performanceChartRanges} />
        </ExpandableSection>
      ) : null}
    </main>
  );
}
