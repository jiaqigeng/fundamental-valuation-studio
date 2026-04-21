import Link from "next/link";

import { DcfCalculatorPanel } from "@/app/_components/dcf-calculator-panel";
import { getDcfBaselineData } from "@/app/_lib/valuation";

const FEATURED_TICKERS = ["AAPL", "MSFT", "KO"] as const;

export default async function ValuationPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const activeTicker =
    resolvedSearchParams.ticker?.trim().toUpperCase() || "AAPL";
  const baseline = await getDcfBaselineData(activeTicker);

  return (
    <main className="dashboard-shell valuation-page-shell">
      <section className="dashboard-hero valuation-hero">
        <div className="valuation-hero-topbar">
          <p className="eyebrow">Valuation</p>
          <Link className="back-link valuation-home-link" href="/">
            Back to home
          </Link>
        </div>
        <h1 className="dashboard-company-title">
          Value a company with a cleaner DCF workflow.
        </h1>
        <p className="hero-copy valuation-hero-copy">
          Start from the latest free cash flow, cash, debt, share count, and
          stock price. Then set only the growth path, terminal growth, discount
          rate, and projection horizon.
        </p>
        <div
          className="ticker-chip-row valuation-ticker-row"
          aria-label="Featured valuation tickers"
        >
          {FEATURED_TICKERS.map((ticker) => (
            <Link
              key={ticker}
              className={`ticker-chip valuation-ticker-chip${ticker === activeTicker ? " valuation-ticker-chip-active" : ""}`}
              href={`/valuation?ticker=${ticker}`}
            >
              {ticker}
            </Link>
          ))}
        </div>
        <Link
          className="valuation-secondary-link valuation-dashboard-link"
          href={`/dashboard/${encodeURIComponent(activeTicker)}`}
        >
          Open {activeTicker} dashboard
        </Link>
      </section>

      {baseline !== null ? (
        <DcfCalculatorPanel baseline={baseline} />
      ) : (
        <section className="workspace-panel valuation-empty-state">
          <p className="panel-label">Calculator unavailable</p>
          <h2>We couldn&apos;t load a DCF baseline for {activeTicker}.</h2>
          <p className="panel-copy">
            Try one of the featured tickers above or return to the dashboard
            flow to confirm the company can be loaded there first.
          </p>
        </section>
      )}
    </main>
  );
}
