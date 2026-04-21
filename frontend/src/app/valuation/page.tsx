import Link from "next/link";

export default function ValuationPage() {
  return (
    <main className="landing-shell">
      <section className="landing-hero valuation-hero">
        <p className="eyebrow">Valuation</p>
        <h1>Build intrinsic value views from one workspace.</h1>
        <p className="hero-copy">
          The valuation surface is now online as its own route. The backend DCF
          math layer is already in place, and the next UI slice will prefill
          assumptions from company data so you can move from a ticker to an
          editable model more directly.
        </p>
        <div className="valuation-hero-actions">
          <Link className="back-link landing-valuation-link" href="/">
            Back to home
          </Link>
          <Link className="valuation-secondary-link" href="/dashboard/AAPL">
            Open Apple dashboard
          </Link>
        </div>
      </section>

      <section className="supported-companies project-overview" aria-label="Valuation roadmap">
        <p className="panel-label">What&apos;s next</p>
        <div className="project-overview-grid">
          <article className="project-overview-card">
            <h2>DCF baseline</h2>
            <p>
              Prefill growth, margin, WACC, and terminal assumptions from
              company data, while keeping every input user-editable.
            </p>
          </article>
          <article className="project-overview-card">
            <h2>Model expansion</h2>
            <p>
              Add dividend discount, residual-income, and peer-comparison views
              so valuation methods can be compared side by side.
            </p>
          </article>
          <article className="project-overview-card">
            <h2>Scenario tools</h2>
            <p>
              Layer in bull, base, and bear cases plus sensitivity grids to
              turn point estimates into a full valuation range.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
