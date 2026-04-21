import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/valuations/dcf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responsePayload =
      (await response.json().catch(() => null)) ??
      ({ detail: "We couldn't recalculate the DCF output right now." } as const);

    return NextResponse.json(responsePayload, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        detail: "We couldn't recalculate the DCF output right now.",
      },
      { status: 503 },
    );
  }
}
