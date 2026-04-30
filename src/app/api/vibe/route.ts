import { NextRequest, NextResponse } from "next/server";

import { fetchTokenLive } from "@/lib/marketData";
import { getTokenMetrics } from "@/lib/mockData";

export const runtime = "edge";

interface VibePayload {
  symbol?: string;
}

const SENTIMENT = {
  bullish: ["explosive", "frenzied", "euphoric", "high-conviction"],
  neutral: ["measured", "rotational", "consolidating", "watchful"],
  bearish: ["fragile", "exhausted", "distributing", "rotation-heavy"],
};

const NARRATORS = [
  "Vibe Engine",
  "Sentiment Pulse",
  "On-chain Whisperer",
];

export async function POST(req: NextRequest) {
  let payload: VibePayload = {};
  try {
    payload = (await req.json()) as VibePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const symbol = (payload.symbol ?? "").trim();
  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  const live = await fetchTokenLive(symbol);
  const metrics = live?.metrics ?? getTokenMetrics(symbol);
  const dataSource =
    live?.source === "dexscreener"
      ? "DexScreener"
      : live?.source === "gateio"
        ? "Gate.io spot ticker"
        : "Vibe Lab (simulated)";
  const tone =
    metrics.vibeScore >= 75
      ? "bullish"
      : metrics.vibeScore <= 45
        ? "bearish"
        : "neutral";

  const adjective =
    SENTIMENT[tone][Math.floor(Math.random() * SENTIMENT[tone].length)];
  const narrator =
    NARRATORS[Math.floor(Math.random() * NARRATORS.length)];

  const liquidityHuman =
    metrics.liquidity >= 1_000_000_000
      ? `$${(metrics.liquidity / 1_000_000_000).toFixed(2)}B`
      : `$${(metrics.liquidity / 1_000_000).toFixed(1)}M`;

  const lines = [
    `## ${narrator} · $${metrics.symbol}`,
    ``,
    `**Verdict:** ${tone.toUpperCase()} · vibe score ${metrics.vibeScore}/100 (${
      metrics.vibeChange24h >= 0 ? "+" : ""
    }${metrics.vibeChange24h.toFixed(1)} pts 24h).`,
    ``,
    `Social channels around $${metrics.symbol} on ${metrics.chain} read ${adjective}. Mention velocity is ${
      metrics.vibeChange24h >= 0 ? "accelerating" : "decaying"
    }, with retail chatter clustering around momentum and narrative reflexivity.`,
    ``,
    `On-chain footprint shows ${liquidityHuman} of liquidity (${
      metrics.liquidityChange24h >= 0 ? "+" : ""
    }${metrics.liquidityChange24h.toFixed(2)}% 24h) and a price tape ${
      metrics.priceChange24h >= 0 ? "expanding" : "compressing"
    } by ${Math.abs(metrics.priceChange24h).toFixed(2)}% over the last session.`,
    ``,
    `### What to watch`,
    `- Whale flow concentration vs CEX inflows.`,
    `- Funding rates ${tone === "bullish" ? "trending hot" : "cooling"}, watch for squeeze conditions.`,
    `- Narrative crossover with adjacent ${metrics.chain} ecosystem plays.`,
    ``,
    `Source: ${dataSource}.`,
    `> Not financial advice. Vibe is a signal, not a strategy.`,
    ``,
  ];

  const text = lines.join("\n");

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const tokens = text.match(/(\s+|[^\s]+)/g) ?? [text];
      for (const token of tokens) {
        controller.enqueue(encoder.encode(token));
        await new Promise((r) => setTimeout(r, 18 + Math.random() * 28));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Vibe-Tone": tone,
    },
  });
}
