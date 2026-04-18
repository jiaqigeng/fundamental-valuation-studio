"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type TickerSearchFormProps = {
  readonly initialTicker?: string;
};

export function TickerSearchForm({
  initialTicker = "",
}: TickerSearchFormProps) {
  const router = useRouter();
  const [ticker, setTicker] = useState(initialTicker);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTicker = ticker.trim().toUpperCase();
    if (!normalizedTicker) {
      return;
    }

    startTransition(() => {
      router.push(`/dashboard/${normalizedTicker}`);
    });
  }

  return (
    <form className="ticker-search-form" onSubmit={handleSubmit}>
      <label className="ticker-search-label" htmlFor="ticker-input">
        Ticker
      </label>
      <div className="ticker-search-controls">
        <input
          id="ticker-input"
          className="ticker-search-input"
          name="ticker"
          type="text"
          value={ticker}
          onChange={(event) => setTicker(event.target.value)}
          placeholder="AAPL"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          aria-describedby="ticker-search-help"
        />
        <button
          className="ticker-search-button"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Load dashboard"}
        </button>
      </div>
      <p className="ticker-search-help" id="ticker-search-help">
        Search by ticker to open the company workspace.
      </p>
    </form>
  );
}
