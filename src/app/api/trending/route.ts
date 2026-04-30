import { NextResponse } from "next/server";

import { fetchTrendingLive } from "@/lib/marketData";
import { getTrending, type VibeListItem } from "@/lib/mockData";

export const runtime = "edge";
export const revalidate = 30;

const TRACKED_SYMBOLS = ["WIF", "BOME", "TIA", "JUP", "PEPE", "ARB"];

export interface TrendingApiResponse {
  items: VibeListItem[];
  source: "live" | "mock" | "mixed";
  fetchedAt: number;
}

export async function GET() {
  const fallback = getTrending();
  let live: Map<string, VibeListItem>;
  try {
    live = await fetchTrendingLive(TRACKED_SYMBOLS);
  } catch {
    live = new Map();
  }

  const items: VibeListItem[] = fallback.map((mock) => {
    const liveItem = live.get(mock.symbol);
    return liveItem
      ? { ...liveItem, tag: liveItem.tag ?? mock.tag }
      : mock;
  });

  const liveCount = items.filter((i) => live.has(i.symbol)).length;
  const source: TrendingApiResponse["source"] =
    liveCount === items.length
      ? "live"
      : liveCount === 0
        ? "mock"
        : "mixed";

  const body: TrendingApiResponse = {
    items,
    source,
    fetchedAt: Date.now(),
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}
