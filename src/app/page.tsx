"use client";

import { motion } from "framer-motion";
import { ExternalLink, RadioTower, RefreshCcw } from "lucide-react";
import * as React from "react";

import { DataCards } from "@/components/dashboard/DataCards";
import { Header } from "@/components/dashboard/Header";
import { VibeAnalyzer } from "@/components/dashboard/VibeAnalyzer";
import { VibeList } from "@/components/dashboard/VibeList";
import { useTokenMetrics } from "@/hooks/useTokenMetrics";
import { useTrending } from "@/hooks/useTrending";
import { getTokenMetrics, getTrending } from "@/lib/mockData";
import {
  fadeUp,
  fadeUpSoft,
  scaleIn,
  staggerContainer,
  wordReveal,
} from "@/lib/motion";

export default function DashboardPage() {
  const [symbol, setSymbol] = React.useState<string>("SOL");

  const tokenQuery = useTokenMetrics(symbol);
  const trendingQuery = useTrending();

  const metrics = tokenQuery.data?.metrics ?? getTokenMetrics(symbol);
  const trending = trendingQuery.data?.items ?? getTrending();

  const handleSelect = React.useCallback((next: string) => {
    setSymbol(next.replace(/^\$/, "").toUpperCase());
  }, []);

  const source = tokenQuery.data?.source;
  const sourceLabel =
    source === "dexscreener"
      ? "Live · DexScreener"
      : source === "gateio"
        ? "Live · Gate.io"
        : "Live · Beta";
  const trendingLive =
    trendingQuery.data?.source === "live" ||
    trendingQuery.data?.source === "mixed";
  const fetchedAt = tokenQuery.data?.fetchedAt
    ? new Date(tokenQuery.data.fetchedAt)
    : null;

  return (
    <>
      <AmbientBackdrop />
      <Header />
      <motion.main
        variants={staggerContainer(0.1, 0.28)}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:gap-8 md:py-10"
      >
        <SectionLabel
          chip={sourceLabel}
          title={
            <>
              Command Center for{" "}
              <span className="text-gradient">Solana &amp; Ethereum</span>{" "}
              traders
            </>
          }
          description="Stream any token through the Vibe Engine to fuse real-time DEX/CEX prices with social signal into a single verdict."
        />

        <motion.div variants={scaleIn}>
          <VibeAnalyzer
            symbol={symbol}
            onSymbolChange={(next) =>
              setSymbol(next.replace(/^\$/, "").toUpperCase())
            }
            onAnalyzed={(s) => setSymbol(s.replace(/^\$/, "").toUpperCase())}
          />
        </motion.div>

        <motion.div variants={fadeUpSoft}>
          <ActiveTokenBar
            symbol={metrics.symbol}
            name={metrics.name}
            chain={metrics.chain}
            source={source ?? "mock"}
            isFetching={tokenQuery.isFetching}
            fetchedAt={fetchedAt}
            onRefresh={() => tokenQuery.refetch()}
            pairUrl={tokenQuery.data?.pair?.url ?? null}
            dex={tokenQuery.data?.pair?.dex ?? null}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <DataCards metrics={metrics} />
        </motion.div>

        <motion.div variants={fadeUp}>
          <VibeList
            items={trending}
            selected={symbol}
            onSelect={handleSelect}
            isLive={trendingLive}
          />
        </motion.div>

        <motion.footer
          variants={fadeUpSoft}
          className="mt-2 flex items-center justify-between border-t border-white/[0.04] pt-6 text-[11px] text-white/35"
        >
          <span>
            VibeScan AI · Live prices via{" "}
            <a
              className="underline decoration-white/20 hover:text-white/60"
              href="https://dexscreener.com"
              target="_blank"
              rel="noreferrer"
            >
              DexScreener
            </a>{" "}
            &amp;{" "}
            <a
              className="underline decoration-white/20 hover:text-white/60"
              href="https://www.gate.io"
              target="_blank"
              rel="noreferrer"
            >
              Gate.io
            </a>{" "}
            · Vibes are signals, not strategies.
          </span>
          <span className="font-mono">v0.2.0</span>
        </motion.footer>
      </motion.main>
    </>
  );
}

function AmbientBackdrop() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -left-40 top-[-15%] h-[36rem] w-[36rem] rounded-full bg-violet-500/15 blur-[120px]"
        animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.6, 0.95, 0.6] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[-10%] top-[-5%] h-[32rem] w-[32rem] rounded-full bg-cyan-400/12 blur-[120px]"
        animate={{ x: [0, -22, 0], y: [0, 18, 0], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="absolute right-[10%] bottom-[-15%] h-[28rem] w-[28rem] rounded-full bg-fuchsia-400/10 blur-[120px]"
        animate={{ x: [0, 18, 0], y: [0, -16, 0], opacity: [0.45, 0.8, 0.45] }}
        transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
      />
    </motion.div>
  );
}

function SectionLabel({
  chip,
  title,
  description,
}: {
  chip: string;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <motion.div
      variants={staggerContainer(0.1, 0.05)}
      className="flex flex-col gap-3"
    >
      <motion.span
        variants={fadeUpSoft}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/65"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        {chip}
      </motion.span>
      <motion.h1
        variants={wordReveal}
        className="max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-4xl"
      >
        {title}
      </motion.h1>
      <motion.p
        variants={fadeUpSoft}
        className="max-w-2xl text-sm text-white/55 md:text-base"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

interface ActiveTokenBarProps {
  symbol: string;
  name: string;
  chain: string;
  source: "dexscreener" | "gateio" | "mock";
  isFetching: boolean;
  fetchedAt: Date | null;
  onRefresh: () => void;
  pairUrl: string | null;
  dex: string | null;
}

const SOURCE_BADGE: Record<
  ActiveTokenBarProps["source"],
  { label: string; className: string }
> = {
  dexscreener: {
    label: "Live · DexScreener",
    className:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  gateio: {
    label: "Live · Gate.io",
    className: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  },
  mock: {
    label: "Mock",
    className: "border-white/10 bg-white/[0.04] text-white/55",
  },
};

const SOURCE_LINK_LABEL: Record<
  ActiveTokenBarProps["source"],
  string
> = {
  dexscreener: "DexScreener",
  gateio: "Gate.io",
  mock: "Open chart",
};

function ActiveTokenBar({
  symbol,
  name,
  chain,
  source,
  isFetching,
  fetchedAt,
  onRefresh,
  pairUrl,
  dex,
}: ActiveTokenBarProps) {
  const badge = SOURCE_BADGE[source];
  const isLive = source !== "mock";
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
          Active token
        </p>
        <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold text-white md:text-2xl">
          <span>${symbol}</span>
          <span className="text-sm font-normal text-white/45">
            {name} · {chain}
          </span>
          <span
            className={
              "inline-flex items-center gap-1 rounded-full border px-2 py-[1px] text-[10px] font-medium uppercase tracking-[0.16em] " +
              badge.className
            }
          >
            {isLive && <RadioTower className="h-3 w-3" />}
            {badge.label}
          </span>
        </h2>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-white/45">
        {dex && (
          <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-medium text-white/60 sm:inline">
            via {dex}
          </span>
        )}
        {fetchedAt && (
          <span className="hidden font-mono uppercase tracking-[0.14em] sm:inline">
            updated {formatRelative(fetchedAt)}
          </span>
        )}
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
        >
          <RefreshCcw
            className={
              "h-3 w-3 " + (isFetching ? "animate-spin text-white" : "")
            }
            strokeWidth={2.25}
          />
          Refresh
        </button>
        {pairUrl && (
          <a
            href={pairUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-medium text-white/70 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            {SOURCE_LINK_LABEL[source]}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function formatRelative(date: Date): string {
  const diff = Math.max(0, Date.now() - date.getTime());
  if (diff < 5_000) return "now";
  if (diff < 60_000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  return date.toLocaleTimeString();
}
