"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Flame } from "lucide-react";

import { Sparkline } from "@/components/dashboard/Sparkline";
import { formatPrice } from "@/lib/utils";
import type { VibeListItem } from "@/lib/mockData";

interface VibeListProps {
  items: VibeListItem[];
  selected?: string;
  onSelect?: (symbol: string) => void;
  isLive?: boolean;
}

const TAG_STYLE: Record<VibeListItem["tag"], string> = {
  Hot: "bg-rose-400/10 text-rose-200 border-rose-400/20",
  Trending: "bg-amber-400/10 text-amber-200 border-amber-400/20",
  "Whale Alert": "bg-cyan-400/10 text-cyan-200 border-cyan-400/20",
  Stealth: "bg-violet-400/10 text-violet-200 border-violet-400/20",
  Cooling: "bg-slate-400/10 text-slate-200 border-slate-400/20",
};

export function VibeList({
  items,
  selected,
  onSelect,
  isLive = false,
}: VibeListProps) {
  return (
    <section className="glass relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-300" />
          <h3 className="text-sm font-semibold tracking-tight text-white">
            Trending Vibe
          </h3>
          <span
            className={
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] " +
              (isLive
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/[0.04] text-white/55")
            }
          >
            {isLive ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/80 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live
              </>
            ) : (
              "Mock"
            )}
          </span>
        </div>
        <span className="hidden text-[11px] uppercase tracking-[0.18em] text-white/35 md:inline">
          Click a row to analyze
        </span>
      </div>

      <ul className="divide-y divide-white/[0.04]">
        {items.map((item, i) => {
          const positive = item.change24h >= 0;
          const isSelected = selected === item.symbol;
          return (
            <motion.li
              key={item.symbol}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.4 }}
            >
              <button
                type="button"
                onClick={() => onSelect?.(item.symbol)}
                className={
                  "group flex w-full items-center gap-4 px-6 py-3.5 text-left transition " +
                  (isSelected
                    ? "bg-white/[0.04]"
                    : "hover:bg-white/[0.025]")
                }
              >
                <div className="flex w-10 items-center justify-center">
                  <span className="font-mono text-[11px] text-white/35">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">
                      ${item.symbol}
                    </span>
                    <span className="text-xs text-white/45">{item.name}</span>
                    <span
                      className={
                        "inline-flex items-center rounded-full border px-2 py-[1px] text-[10px] font-medium " +
                        TAG_STYLE[item.tag]
                      }
                    >
                      {item.tag}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/40">{item.chain}</div>
                </div>

                <div className="hidden shrink-0 md:block">
                  <Sparkline data={item.spark} width={108} height={28} />
                </div>

                <div className="flex w-24 flex-col items-end gap-0.5 text-right">
                  <span className="font-mono text-sm text-white tabular-nums">
                    {formatPrice(item.price)}
                  </span>
                  <span
                    className={
                      "inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums " +
                      (positive ? "text-emerald-300" : "text-rose-300")
                    }
                  >
                    {positive ? (
                      <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" strokeWidth={2.5} />
                    )}
                    {Math.abs(item.change24h).toFixed(2)}%
                  </span>
                </div>

                <div className="hidden w-28 shrink-0 flex-col items-end gap-1 sm:flex">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                    Vibe
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300"
                        style={{ width: `${item.vibeScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-white tabular-nums">
                      {item.vibeScore}
                    </span>
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
