import {
  fetchFromDexscreener,
  metricsToVibeListItem,
  normalizeSymbol,
  type LiveResolution,
} from "@/lib/dexscreener";
import { fetchFromGate } from "@/lib/gateio";
import type { VibeListItem } from "@/lib/mockData";

export { normalizeSymbol } from "@/lib/dexscreener";
export type { LiveResolution, LiveSource } from "@/lib/dexscreener";

export async function fetchTokenLive(
  rawSymbol: string
): Promise<LiveResolution | null> {
  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol) return null;

  const dsPromise = fetchFromDexscreener(symbol).catch(() => null);
  const gatePromise = fetchFromGate(symbol).catch(() => null);

  const [ds, gate] = await Promise.all([dsPromise, gatePromise]);

  if (ds) return ds;
  if (gate) return gate;
  return null;
}

export async function fetchTrendingLive(
  symbols: string[]
): Promise<Map<string, VibeListItem>> {
  const results = await Promise.allSettled(
    symbols.map(async (s) => {
      const live = await fetchTokenLive(s);
      if (!live) return null;
      return [normalizeSymbol(s), metricsToVibeListItem(live.metrics)] as const;
    })
  );

  const map = new Map<string, VibeListItem>();
  for (const r of results) {
    if (r.status === "fulfilled" && r.value) {
      map.set(r.value[0], r.value[1]);
    }
  }
  return map;
}
