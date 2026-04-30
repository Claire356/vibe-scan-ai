"use client";

import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Droplets,
  LineChart,
  Sparkles,
} from "lucide-react";
import * as React from "react";

import { CountUp } from "@/components/dashboard/CountUp";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPrice } from "@/lib/utils";
import type { TokenMetrics } from "@/lib/mockData";

interface DataCardsProps {
  metrics: TokenMetrics;
}

export function DataCards({ metrics }: DataCardsProps) {
  const cards = [
    {
      key: "price",
      title: "Price",
      icon: <LineChart className="h-4 w-4" />,
      accent: "from-cyan-400/20 via-sky-400/10 to-transparent",
      ring: "ring-cyan-400/25",
      value: metrics.price,
      delta: metrics.priceChange24h,
      format: formatPrice,
      footer: (
        <Sparkline
          data={metrics.sparkline}
          width={140}
          height={36}
          className="text-cyan-300"
        />
      ),
    },
    {
      key: "liquidity",
      title: "Liquidity",
      icon: <Droplets className="h-4 w-4" />,
      accent: "from-emerald-400/20 via-teal-400/10 to-transparent",
      ring: "ring-emerald-400/25",
      value: metrics.liquidity,
      delta: metrics.liquidityChange24h,
      format: (n: number) => formatCurrency(n, 1),
      footer: (
        <div className="flex items-center gap-2 text-[11px] text-white/45">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
          24h pool depth
        </div>
      ),
    },
    {
      key: "vibe",
      title: "Vibe Score",
      icon: <Sparkles className="h-4 w-4" />,
      accent: "from-fuchsia-400/20 via-violet-400/10 to-transparent",
      ring: "ring-violet-400/25",
      value: metrics.vibeScore,
      delta: metrics.vibeChange24h,
      format: (n: number) => `${Math.round(n)}`,
      suffix: "/100",
      footer: <VibeBar score={metrics.vibeScore} />,
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card, i) => {
        const positive = card.delta >= 0;
        return (
          <motion.div
            key={`${card.key}-${metrics.symbol}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
          >
            <Card className="group h-full">
              <div
                className={
                  "pointer-events-none absolute -top-20 right-0 h-40 w-40 rounded-full bg-gradient-to-br blur-3xl transition-opacity group-hover:opacity-80 " +
                  card.accent
                }
              />
              <CardHeader className="relative flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-white/80 ring-1 " +
                      card.ring
                    }
                  >
                    {card.icon}
                  </span>
                  {card.title}
                </CardTitle>
                <DeltaPill delta={card.delta} positive={positive} />
              </CardHeader>

              <div className="relative mt-4 flex items-end justify-between gap-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-semibold tracking-tight text-white tabular-nums">
                    <CountUp
                      value={card.value}
                      format={card.format}
                      duration={1.1}
                    />
                  </span>
                  {"suffix" in card && card.suffix ? (
                    <span className="text-sm text-white/40">{card.suffix}</span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-end">{card.footer}</div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function DeltaPill({ delta, positive }: { delta: number; positive: boolean }) {
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={
        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium tabular-nums " +
        (positive
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/30 bg-rose-400/10 text-rose-300")
      }
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {Math.abs(delta).toFixed(2)}%
    </span>
  );
}

function VibeBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score));
  return (
    <div className="flex w-32 flex-col gap-1.5">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-white/35">
        <span>Bear</span>
        <span>Bull</span>
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300"
        />
      </div>
    </div>
  );
}
