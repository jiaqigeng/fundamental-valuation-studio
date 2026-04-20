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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTicker = ticker.trim().toUpperCase();
    if (!normalizedTicker) {
      setErrorMessage("Enter a ticker to open a company workspace.");
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
        router.push(`/dashboard/${normalizedTicker}`);
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
          onChange={(event) => {
            setTicker(event.target.value);
            if (errorMessage) {
              setErrorMessage(null);
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
        <button
          className="ticker-search-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Checking ticker..." : "Open workspace"}
        </button>
      </div>
      <p className="ticker-search-help" id="ticker-search-help">
        Search by a public-company ticker to open the company workspace.
      </p>
      {errorMessage ? (
        <p className="ticker-search-error" id="ticker-search-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}
