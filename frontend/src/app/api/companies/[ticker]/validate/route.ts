import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const normalizedTicker = ticker.trim().toUpperCase();

  if (!normalizedTicker) {
    return NextResponse.json(
      {
        valid: false,
        message: "Enter a ticker to open a company workspace.",
      },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${BACKEND_BASE_URL}/companies/${encodeURIComponent(normalizedTicker)}/workspace`,
      { cache: "no-store" },
    );

    if (response.ok) {
      return NextResponse.json({ valid: true });
    }

    if (response.status === 404) {
      return NextResponse.json(
        {
          valid: false,
          message: `Ticker "${normalizedTicker}" is not valid.`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        valid: false,
        message: "We couldn't verify that ticker right now. Please try again in a moment.",
      },
      { status: 503 },
    );
  } catch {
    return NextResponse.json(
      {
        valid: false,
        message: "We couldn't verify that ticker right now. Please try again in a moment.",
      },
      { status: 503 },
    );
  }
}
