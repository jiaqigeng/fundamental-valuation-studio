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
        <p className="eyebrow">Company Workspace</p>
        <h1>
          {company.name} ({company.ticker})
        </h1>
        <p className="hero-copy">{company.workspaceTagline}</p>
      </div>

      <section className="workspace-panel">
        <p className="panel-label">Active company</p>
        <p className="panel-value">{company.ticker}</p>
        <p className="panel-copy">
          This dashboard route is now live and ready for the higher-priority
          company overview features that depend on company selection.
        </p>
      </section>

      <Link className="back-link" href="/">
        Search another ticker
      </Link>
    </main>
  );
}
