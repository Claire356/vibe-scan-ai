export interface TokenMetrics {
  symbol: string;
  name: string;
  chain: "Solana" | "Ethereum" | "Base" | "Arbitrum";
  price: number;
  priceChange24h: number;
  liquidity: number;
  liquidityChange24h: number;
  vibeScore: number;
  vibeChange24h: number;
  sparkline: number[];
}

export interface VibeListItem {
  symbol: string;
  name: string;
  chain: TokenMetrics["chain"];
  price: number;
  change24h: number;
  vibeScore: number;
  spark: number[];
  tag: "Trending" | "Hot" | "Whale Alert" | "Stealth" | "Cooling";
}

const PRESET: Record<string, TokenMetrics> = {
  SOL: {
    symbol: "SOL",
    name: "Solana",
    chain: "Solana",
    price: 184.62,
    priceChange24h: 4.31,
    liquidity: 2_640_000_000,
    liquidityChange24h: 1.84,
    vibeScore: 87,
    vibeChange24h: 6.4,
    sparkline: buildSpark(48, 170, 190, 0.6),
  },
  ETH: {
    symbol: "ETH",
    name: "Ethereum",
    chain: "Ethereum",
    price: 3_412.18,
    priceChange24h: 1.27,
    liquidity: 9_120_000_000,
    liquidityChange24h: 0.42,
    vibeScore: 78,
    vibeChange24h: 2.1,
    sparkline: buildSpark(48, 3_200, 3_500, 0.4),
  },
  WIF: {
    symbol: "WIF",
    name: "dogwifhat",
    chain: "Solana",
    price: 2.34,
    priceChange24h: 12.6,
    liquidity: 84_500_000,
    liquidityChange24h: 8.9,
    vibeScore: 92,
    vibeChange24h: 11.3,
    sparkline: buildSpark(48, 1.9, 2.6, 1.4),
  },
  BONK: {
    symbol: "BONK",
    name: "Bonk",
    chain: "Solana",
    price: 0.0000281,
    priceChange24h: -3.42,
    liquidity: 41_200_000,
    liquidityChange24h: -1.7,
    vibeScore: 64,
    vibeChange24h: -4.8,
    sparkline: buildSpark(48, 0.000026, 0.0000295, 1.6),
  },
  PEPE: {
    symbol: "PEPE",
    name: "Pepe",
    chain: "Ethereum",
    price: 0.0000122,
    priceChange24h: 7.94,
    liquidity: 64_300_000,
    liquidityChange24h: 4.2,
    vibeScore: 81,
    vibeChange24h: 5.5,
    sparkline: buildSpark(48, 0.0000108, 0.0000128, 1.2),
  },
};

const TRENDING: VibeListItem[] = [
  {
    symbol: "WIF",
    name: "dogwifhat",
    chain: "Solana",
    price: 2.34,
    change24h: 12.6,
    vibeScore: 92,
    spark: buildSpark(40, 1.9, 2.6, 1.5),
    tag: "Hot",
  },
  {
    symbol: "BOME",
    name: "Book of Meme",
    chain: "Solana",
    price: 0.0124,
    change24h: 26.9,
    vibeScore: 88,
    spark: buildSpark(40, 0.009, 0.014, 2.3),
    tag: "Trending",
  },
  {
    symbol: "TIA",
    name: "Celestia",
    chain: "Ethereum",
    price: 9.87,
    change24h: 4.1,
    vibeScore: 81,
    spark: buildSpark(40, 9.1, 10.2, 0.8),
    tag: "Stealth",
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    chain: "Solana",
    price: 1.18,
    change24h: -2.3,
    vibeScore: 74,
    spark: buildSpark(40, 1.1, 1.25, 0.7),
    tag: "Whale Alert",
  },
  {
    symbol: "PEPE",
    name: "Pepe",
    chain: "Ethereum",
    price: 0.0000122,
    change24h: 7.94,
    vibeScore: 80,
    spark: buildSpark(40, 0.0000108, 0.0000128, 1.1),
    tag: "Trending",
  },
  {
    symbol: "ARB",
    name: "Arbitrum",
    chain: "Arbitrum",
    price: 1.04,
    change24h: -1.2,
    vibeScore: 62,
    spark: buildSpark(40, 1.0, 1.1, 0.6),
    tag: "Cooling",
  },
];

export function getTokenMetrics(symbol: string): TokenMetrics {
  const normalized = symbol.replace(/^\$/, "").trim().toUpperCase();
  if (PRESET[normalized]) return PRESET[normalized];

  const seed = hashString(normalized || "VIBE");
  const rng = mulberry32(seed);
  const price = +(rng() * 50 + 0.05).toFixed(4);
  const range = price * 0.18;
  return {
    symbol: normalized || "VIBE",
    name: normalized ? `${normalized} Token` : "Unknown",
    chain: pick(rng, ["Solana", "Ethereum", "Base", "Arbitrum"]),
    price,
    priceChange24h: +((rng() * 30 - 8).toFixed(2)),
    liquidity: Math.round(rng() * 250_000_000 + 5_000_000),
    liquidityChange24h: +((rng() * 14 - 4).toFixed(2)),
    vibeScore: Math.round(rng() * 70 + 25),
    vibeChange24h: +((rng() * 18 - 6).toFixed(2)),
    sparkline: buildSpark(48, price - range, price + range, 0.9, seed),
  };
}

export function getTrending(): VibeListItem[] {
  return TRENDING;
}

function buildSpark(
  count: number,
  low: number,
  high: number,
  volatility = 1,
  seed = 7919
): number[] {
  const rng = mulberry32(seed);
  const mid = (low + high) / 2;
  const amp = (high - low) / 2;
  const out: number[] = [];
  let v = mid + (rng() - 0.5) * amp;
  for (let i = 0; i < count; i++) {
    const drift = Math.sin(i / 4 + seed * 0.001) * amp * 0.4;
    const noise = (rng() - 0.5) * amp * volatility * 0.4;
    v = clamp(v + noise * 0.5 + drift * 0.05, low, high);
    out.push(+v.toFixed(8));
  }
  return out;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
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

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
