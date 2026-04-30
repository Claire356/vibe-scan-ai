import { NextResponse } from "next/server";

import {
  fetchTokenLive,
  normalizeSymbol,
  type LiveSource,
} from "@/lib/marketData";
import { getTokenMetrics, type TokenMetrics } from "@/lib/mockData";

export const runtime = "edge";
export const revalidate = 30;

export interface TokenApiResponse {
  metrics: TokenMetrics;
  source: LiveSource;
  pair: {
    pairAddress: string;
    dex: string;
    url: string;
    quote: string;
    fdv?: number;
    marketCap?: number;
    volume24h?: number;
  } | null;
  fetchedAt: number;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: raw } = await params;
  const symbol = normalizeSymbol(raw);

  if (!symbol) {
    return NextResponse.json(
      { error: "symbol is required" },
      { status: 400 }
    );
  }

  const live = await fetchTokenLive(symbol);

  if (live) {
    const body: TokenApiResponse = {
      metrics: live.metrics,
      source: live.source,
      pair: live.pair ?? null,
      fetchedAt: Date.now(),
    };
    return NextResponse.json(body, {
      headers: {
        "Cache-Control":
          "public, s-maxage=30, stale-while-revalidate=120",
      },
    });
  }

  const body: TokenApiResponse = {
    metrics: getTokenMetrics(symbol),
    source: "mock",
    pair: null,
    fetchedAt: Date.now(),
  };
  return NextResponse.json(body, {
    headers: {
      "Cache-Control":
        "public, s-maxage=15, stale-while-revalidate=60",
    },
  });
}
