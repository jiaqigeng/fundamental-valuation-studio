import Link from "next/link";
import { TickerSearchForm } from "@/app/_components/ticker-search-form";

export default function Home() {
  return (
    <main className="landing-shell">
      <section className="landing-hero">
        <p className="eyebrow">Fundamental Valuation Studio</p>
        <h1>Open a company workspace by ticker.</h1>
        <p className="hero-copy">
          Start with a public ticker, then build toward dashboard context,
          intrinsic value models, and AI-assisted analysis from one workspace.
        </p>
        <TickerSearchForm initialTicker="AAPL" />
      </section>

      <section className="supported-companies" aria-label="Supported tickers">
        <p className="panel-label">Demo coverage</p>
        <div className="ticker-chip-row">
          <Link className="ticker-chip" href="/dashboard/AAPL">
            AAPL
          </Link>
          <Link className="ticker-chip" href="/dashboard/MSFT">
            MSFT
          </Link>
          <Link className="ticker-chip" href="/dashboard/KO">
            KO
          </Link>
        </div>
      </section>
    </main>
  );
}
