"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TickerSearchFormProps = {
  readonly initialTicker?: string;
};

export function TickerSearchForm({
  initialTicker = "",
}: TickerSearchFormProps) {
  const router = useRouter();
  const [ticker, setTicker] = useState(initialTicker);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleRouteSelection(destination: "dashboard" | "valuation") {
    const normalizedTicker = ticker.trim().toUpperCase();
    if (!normalizedTicker) {
      setErrorMessage("Enter a ticker before choosing where to go.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/companies/${encodeURIComponent(normalizedTicker)}/validate`,
        {
          method: "GET",
          cache: "no-store",
        },
      );
      const payload = (await response.json()) as
        | { valid: true }
        | { valid: false; message: string };

      if (payload.valid) {
        if (destination === "dashboard") {
          router.push(`/dashboard/${normalizedTicker}`);
        } else {
          router.push(`/valuation?ticker=${encodeURIComponent(normalizedTicker)}`);
        }
        return;
      }

      setErrorMessage(payload.message);
    } catch {
      setErrorMessage(
        "We couldn't verify that ticker right now. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="ticker-search-form"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
      }}
    >
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
          onChange={(event) => {
            setTicker(event.target.value);
            if (errorMessage) {
              setErrorMessage(null);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
            }
          }}
          placeholder="Ticker symbol"
          autoComplete="off"
          spellCheck={false}
          maxLength={10}
          aria-describedby={
            errorMessage
              ? "ticker-search-help ticker-search-error"
              : "ticker-search-help"
          }
          aria-invalid={errorMessage ? "true" : "false"}
        />
        <div className="ticker-search-actions">
          <button
            className="ticker-search-button"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              void handleRouteSelection("dashboard");
            }}
          >
            {isSubmitting ? "Checking ticker..." : "Financial Dashboard"}
          </button>
          <button
            className="back-link landing-valuation-link"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              void handleRouteSelection("valuation");
            }}
          >
            Value Calculator
          </button>
        </div>
      </div>
      <p className="ticker-search-help" id="ticker-search-help">
        Enter a public-company ticker, then choose whether to open the financial
        dashboard or the value calculators.
      </p>
      {errorMessage ? (
        <p className="ticker-search-error" id="ticker-search-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
