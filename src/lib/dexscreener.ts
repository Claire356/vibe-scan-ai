import type { TokenMetrics, VibeListItem } from "@/lib/mockData";

const DS_BASE = "https://api.dexscreener.com";
const DS_REVALIDATE_SEC = 30;
const DS_TIMEOUT_MS = 4_000;

const CHAIN_LABEL: Record<string, TokenMetrics["chain"]> = {
  solana: "Solana",
  ethereum: "Ethereum",
  base: "Base",
  arbitrum: "Arbitrum",
};

const SYMBOL_ALIASES: Record<string, string[]> = {
  ETH: ["ETH", "WETH"],
  BTC: ["BTC", "WBTC"],
  SOL: ["SOL", "WSOL"],
  BNB: ["BNB", "WBNB"],
  MATIC: ["MATIC", "WMATIC"],
  AVAX: ["AVAX", "WAVAX"],
};

const PREFERRED_CHAIN_ORDER = [
  "solana",
  "ethereum",
  "base",
  "arbitrum",
  "optimism",
  "polygon",
  "bsc",
];

interface DexscreenerToken {
  address: string;
  name: string;
  symbol: string;
}

interface DexscreenerTxnsBucket {
  buys: number;
  sells: number;
}

export interface DexscreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: DexscreenerToken;
  quoteToken: DexscreenerToken;
  priceNative?: string;
  priceUsd?: string;
  liquidity?: { usd?: number; base?: number; quote?: number };
  volume?: Partial<Record<"h24" | "h6" | "h1" | "m5", number>>;
  priceChange?: Partial<Record<"h24" | "h6" | "h1" | "m5", number>>;
  txns?: Partial<Record<"h24" | "h6" | "h1" | "m5", DexscreenerTxnsBucket>>;
  fdv?: number;
  marketCap?: number;
}

interface DexscreenerSearchResponse {
  schemaVersion?: string;
  pairs?: DexscreenerPair[];
}

export type LiveSource = "dexscreener" | "gateio" | "mock";

export interface LiveResolution {
  metrics: TokenMetrics;
  source: LiveSource;
  pair?: {
    pairAddress: string;
    dex: string;
    url: string;
    quote: string;
    fdv?: number;
    marketCap?: number;
    volume24h?: number;
  };
}

export function normalizeSymbol(input: string): string {
  return input.replace(/^\$/, "").trim().toUpperCase();
}

async function dsSearch(query: string): Promise<DexscreenerPair[]> {
  const url = `${DS_BASE}/latest/dex/search?q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "VibeScanAI/0.2 (+vibescan.ai)",
      },
      next: { revalidate: DS_REVALIDATE_SEC },
      signal: AbortSignal.timeout(DS_TIMEOUT_MS),
    });
    if (!res.ok) {
      throw new Error(`DexScreener search failed (${res.status})`);
    }
    const json = (await res.json()) as DexscreenerSearchResponse;
    return json.pairs ?? [];
  } catch (err) {
    const reason = (err as Error)?.name === "TimeoutError" ? "timeout" : (err as Error).message;
    console.warn(`[dexscreener] ${query} -> ${reason}`);
    throw err;
  }
}

function pickBestPair(
  pairs: DexscreenerPair[],
  symbol: string
): DexscreenerPair | null {
  if (!pairs.length) return null;

  const aliases = (SYMBOL_ALIASES[symbol] ?? [symbol]).map((s) =>
    s.toUpperCase()
  );
  const matches = pairs.filter((p) =>
    aliases.includes((p.baseToken?.symbol ?? "").toUpperCase())
  );

  const candidates = matches.length ? matches : pairs;

  return candidates.slice().sort((a, b) => {
    const liqA = a.liquidity?.usd ?? 0;
    const liqB = b.liquidity?.usd ?? 0;
    if (liqB !== liqA) return liqB - liqA;
    const idxA = PREFERRED_CHAIN_ORDER.indexOf(a.chainId);
    const idxB = PREFERRED_CHAIN_ORDER.indexOf(b.chainId);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  })[0] ?? null;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}

export function deriveVibeScore(pair: DexscreenerPair): {
  score: number;
  change24h: number;
} {
  const buys = pair.txns?.h24?.buys ?? 0;
  const sells = pair.txns?.h24?.sells ?? 0;
  const total = buys + sells;
  const buyRatio = total > 0 ? buys / total : 0.5;
  const liq = Math.max(pair.liquidity?.usd ?? 0, 1);
  const turnover = (pair.volume?.h24 ?? 0) / liq;

  const m24 = (pair.priceChange?.h24 ?? 0) / 100;
  const m6 = (pair.priceChange?.h6 ?? 0) / 100;
  const m1 = (pair.priceChange?.h1 ?? 0) / 100;

  let score = 50;
  score += (buyRatio - 0.5) * 50;
  score += clamp(m24 * 50, -15, 15);
  score += clamp(turnover * 200, 0, 12);
  score += clamp(m1 * 80, -8, 8);
  score = clamp(score, 0, 100);

  const change24h = clamp(m6 * 30 + m1 * 20 + (buyRatio - 0.5) * 12, -20, 20);

  return {
    score: Math.round(score),
    change24h: +change24h.toFixed(2),
  };
}

export function buildAnchoredSparkline(
  current: number,
  changePctH24: number,
  count = 48,
  seedSource: string = "vibe"
): number[] {
  const start = current / (1 + changePctH24 / 100);
  const swing = Math.abs(current - start) || current * 0.04;
  const seed = hashString(seedSource);
  const rng = mulberry32(seed);

  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const drift = start + (current - start) * t;
    const noise = (rng() - 0.5) * swing * 0.55;
    const wobble = Math.sin(i * 0.45 + seed * 0.0001) * swing * 0.18;
    out.push(+(drift + noise + wobble).toFixed(8));
  }
  out[count - 1] = +current.toFixed(8);
  return out;
}

export function pairToTokenMetrics(pair: DexscreenerPair): TokenMetrics {
  const symbol = (pair.baseToken?.symbol ?? "").toUpperCase();
  const chain = CHAIN_LABEL[pair.chainId] ?? capitalize(pair.chainId);
  const price = parseFloat(pair.priceUsd ?? "0") || 0;
  const priceChange24h = pair.priceChange?.h24 ?? 0;
  const liquidity = pair.liquidity?.usd ?? 0;

  const liquidityChange24h = clamp(
    (pair.priceChange?.h24 ?? 0) * 0.18 +
      ((pair.priceChange?.h6 ?? 0) - (pair.priceChange?.h24 ?? 0)) * 0.4,
    -25,
    25
  );

  const vibe = deriveVibeScore(pair);

  return {
    symbol,
    name: pair.baseToken?.name ?? symbol,
    chain: chain as TokenMetrics["chain"],
    price,
    priceChange24h: +priceChange24h.toFixed(2),
    liquidity,
    liquidityChange24h: +liquidityChange24h.toFixed(2),
    vibeScore: vibe.score,
    vibeChange24h: vibe.change24h,
    sparkline: buildAnchoredSparkline(
      price,
      priceChange24h,
      48,
      `${symbol}-${pair.pairAddress}`
    ),
  };
}

export async function fetchFromDexscreener(
  rawSymbol: string
): Promise<LiveResolution | null> {
  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol) return null;

  let pairs: DexscreenerPair[];
  try {
    pairs = await dsSearch(symbol);
  } catch {
    return null;
  }

  const best = pickBestPair(pairs, symbol);
  if (!best || !best.priceUsd) return null;

  const metrics = pairToTokenMetrics(best);

  return {
    metrics,
    source: "dexscreener",
    pair: {
      pairAddress: best.pairAddress,
      dex: best.dexId,
      url: best.url,
      quote: best.quoteToken?.symbol ?? "",
      fdv: best.fdv,
      marketCap: best.marketCap,
      volume24h: best.volume?.h24,
    },
  };
}

export function tagFor(change: number, vibe: number): VibeListItem["tag"] {
  if (change >= 15 && vibe >= 75) return "Hot";
  if (change >= 5) return "Trending";
  if (vibe >= 75) return "Stealth";
  if (change <= -3) return "Cooling";
  return "Whale Alert";
}

export function metricsToVibeListItem(m: TokenMetrics): VibeListItem {
  return {
    symbol: m.symbol,
    name: m.name,
    chain: m.chain,
    price: m.price,
    change24h: m.priceChange24h,
    vibeScore: m.vibeScore,
    spark: m.sparkline.slice(-40),
    tag: tagFor(m.priceChange24h, m.vibeScore),
  };
}

function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function rng() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
