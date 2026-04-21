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
    <main className="landing-shell">
      <section className="landing-hero valuation-hero">
        <p className="eyebrow">Valuation</p>
        <h1>Open the calculator stack for a company.</h1>
        <p className="hero-copy">
          Start with a DCF view that already knows the company&apos;s current
          free cash flow, capital structure, beta, Treasury proxy, and stock
          price. From there, enter your own growth and discount assumptions
          instead of relying on hardcoded model guesses.
        </p>
        <div className="ticker-chip-row valuation-ticker-row" aria-label="Featured valuation tickers">
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
        <div className="valuation-hero-actions">
          <Link className="back-link landing-valuation-link" href="/">
            Back to home
          </Link>
          <Link
            className="valuation-secondary-link"
            href={`/dashboard/${encodeURIComponent(activeTicker)}`}
          >
            Open {activeTicker} dashboard
          </Link>
        </div>
      </section>

      <section
        className="supported-companies valuation-calculator-picker"
        aria-label="Calculator lineup"
      >
        <p className="panel-label">Calculator lineup</p>
        <div className="valuation-calculator-cards">
          <article className="project-overview-card valuation-calculator-card valuation-calculator-card-active">
            <p className="valuation-calculator-badge">Live now</p>
            <h2>Discounted cash flow</h2>
            <p>
              Load baseline assumptions from company data, override the core
              drivers, and recompute intrinsic value in one place.
            </p>
          </article>
          <article className="project-overview-card valuation-calculator-card">
            <p className="valuation-calculator-badge">Next up</p>
            <h2>Dividend discount model</h2>
            <p>
              Focus on dividend payers with editable dividend growth and cost of
              equity assumptions.
            </p>
          </article>
          <article className="project-overview-card valuation-calculator-card">
            <p className="valuation-calculator-badge">Planned</p>
            <h2>Residual income model</h2>
            <p>
              Bring book value and ROE-based valuation into the same workspace
              for businesses where FCF is less useful.
            </p>
          </article>
          <article className="project-overview-card valuation-calculator-card">
            <p className="valuation-calculator-badge">Planned</p>
            <h2>Relative valuation</h2>
            <p>
              Compare multiples and implied price ranges against a peer set
              without leaving the valuation flow.
            </p>
          </article>
        </div>
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
