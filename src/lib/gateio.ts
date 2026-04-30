import {
  buildAnchoredSparkline,
  normalizeSymbol,
  type LiveResolution,
} from "@/lib/dexscreener";
import type { TokenMetrics } from "@/lib/mockData";

const GATE_BASE = "https://api.gateio.ws/api/v4";
const GATE_REVALIDATE_SEC = 30;
const GATE_TIMEOUT_MS = 4_000;

const SYMBOL_TO_CHAIN: Record<string, TokenMetrics["chain"]> = {
  SOL: "Solana",
  WIF: "Solana",
  BOME: "Solana",
  BONK: "Solana",
  JUP: "Solana",
  PYTH: "Solana",
  JTO: "Solana",
  RAY: "Solana",
  W: "Solana",

  ETH: "Ethereum",
  PEPE: "Ethereum",
  SHIB: "Ethereum",
  UNI: "Ethereum",
  LINK: "Ethereum",
  AAVE: "Ethereum",
  MKR: "Ethereum",

  ARB: "Arbitrum",
  GMX: "Arbitrum",

  AERO: "Base",
  DEGEN: "Base",
};

const SYMBOL_TO_NAME: Record<string, string> = {
  SOL: "Solana",
  ETH: "Ethereum",
  BTC: "Bitcoin",
  WIF: "dogwifhat",
  BONK: "Bonk",
  JUP: "Jupiter",
  PEPE: "Pepe",
  ARB: "Arbitrum",
  TIA: "Celestia",
  BOME: "Book of Meme",
  PYTH: "Pyth Network",
  JTO: "Jito",
  RAY: "Raydium",
  AERO: "Aerodrome",
  DEGEN: "Degen",
};

interface GateTicker {
  currency_pair: string;
  last: string;
  lowest_ask?: string;
  highest_bid?: string;
  change_percentage: string;
  base_volume?: string;
  quote_volume?: string;
  high_24h?: string;
  low_24h?: string;
}

async function gateTicker(pair: string): Promise<GateTicker | null> {
  const url = `${GATE_BASE}/spot/tickers?currency_pair=${encodeURIComponent(pair)}`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: GATE_REVALIDATE_SEC },
      signal: AbortSignal.timeout(GATE_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GateTicker[];
    return Array.isArray(json) && json.length > 0 ? json[0] : null;
  } catch (err) {
    const reason =
      (err as Error)?.name === "TimeoutError" ? "timeout" : (err as Error).message;
    console.warn(`[gateio] ${pair} -> ${reason}`);
    return null;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

function deriveVibeFromGate(t: GateTicker): {
  score: number;
  change24h: number;
} {
  const last = parseFloat(t.last);
  const change = parseFloat(t.change_percentage) || 0;
  const high = parseFloat(t.high_24h ?? "0") || last;
  const low = parseFloat(t.low_24h ?? "0") || last;
  const ask = parseFloat(t.lowest_ask ?? "0") || last;
  const bid = parseFloat(t.highest_bid ?? "0") || last;
  const quoteVol = parseFloat(t.quote_volume ?? "0") || 0;

  const positionInRange =
    high === low ? 0.5 : clamp((last - low) / Math.max(high - low, 1e-9), 0, 1);
  const spread = ask && bid ? (ask - bid) / Math.max(bid, 1e-9) : 0;
  const turnover = quoteVol / Math.max(last * 1_000_000, 1);

  let score = 50;
  score += clamp(change * 1.2, -20, 20);
  score += (positionInRange - 0.5) * 18;
  score += clamp(turnover * 30, 0, 12);
  score -= clamp(spread * 1500, 0, 8);
  score = clamp(score, 0, 100);

  const change24h = clamp(
    change * 0.55 + (positionInRange - 0.5) * 12,
    -20,
    20
  );

  return { score: Math.round(score), change24h: +change24h.toFixed(2) };
}

function tickerToMetrics(t: GateTicker): TokenMetrics | null {
  const [base] = t.currency_pair.split("_");
  if (!base) return null;
  const symbol = base.toUpperCase();
  const price = parseFloat(t.last);
  if (!Number.isFinite(price) || price <= 0) return null;

  const change = parseFloat(t.change_percentage) || 0;
  const quoteVol = parseFloat(t.quote_volume ?? "0") || 0;

  const vibe = deriveVibeFromGate(t);
  const liquidityProxy = quoteVol;

  return {
    symbol,
    name: SYMBOL_TO_NAME[symbol] ?? symbol,
    chain: SYMBOL_TO_CHAIN[symbol] ?? "Ethereum",
    price,
    priceChange24h: +change.toFixed(2),
    liquidity: Math.round(liquidityProxy),
    liquidityChange24h: +clamp(change * 0.4, -25, 25).toFixed(2),
    vibeScore: vibe.score,
    vibeChange24h: vibe.change24h,
    sparkline: buildAnchoredSparkline(
      price,
      change,
      48,
      `gate-${symbol}-${t.currency_pair}`
    ),
  };
}

export async function fetchFromGate(
  rawSymbol: string
): Promise<LiveResolution | null> {
  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol) return null;

  const ticker = await gateTicker(`${symbol}_USDT`);
  if (!ticker) return null;

  const metrics = tickerToMetrics(ticker);
  if (!metrics) return null;

  return {
    metrics,
    source: "gateio",
    pair: {
      pairAddress: ticker.currency_pair,
      dex: "gate.io",
      url: `https://www.gate.io/trade/${ticker.currency_pair}`,
      quote: "USDT",
      volume24h: parseFloat(ticker.quote_volume ?? "0") || undefined,
    },
  };
}
