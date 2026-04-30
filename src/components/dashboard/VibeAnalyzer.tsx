"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Search, Sparkles, Zap } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVibeAnalysis } from "@/hooks/useVibeAnalysis";
import { fadeUpSoft, staggerContainer, wordReveal } from "@/lib/motion";

interface VibeAnalyzerProps {
  symbol: string;
  onSymbolChange: (next: string) => void;
  onAnalyzed?: (symbol: string) => void;
}

const SUGGESTIONS = ["$SOL", "$WIF", "$ETH", "$PEPE", "$BONK"];

export function VibeAnalyzer({
  symbol,
  onSymbolChange,
  onAnalyzed,
}: VibeAnalyzerProps) {
  const { analyze, text, isLoading, error, symbol: analyzedSymbol } =
    useVibeAnalysis();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = symbol.trim();
    if (!next || isLoading) return;
    onSymbolChange(next);
    void analyze(next).then(() => onAnalyzed?.(next));
  };

  const handleSuggestion = (s: string) => {
    onSymbolChange(s);
    void analyze(s).then(() => onAnalyzed?.(s));
  };

  return (
    <section className="glass relative overflow-hidden p-6 md:p-8">
      <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <motion.div
        variants={staggerContainer(0.08, 0.18)}
        initial="hidden"
        animate="show"
        className="relative flex flex-col gap-2"
      >
        <motion.span
          variants={fadeUpSoft}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/65"
        >
          <Zap className="h-3 w-3 text-amber-300" />
          AI Vibe Analyzer
        </motion.span>
        <motion.h2
          variants={wordReveal}
          className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
        >
          Decode the <span className="text-gradient">market vibe</span> in
          seconds.
        </motion.h2>
        <motion.p
          variants={fadeUpSoft}
          className="max-w-2xl text-sm text-white/55"
        >
          Drop any token symbol and our streaming AI fuses social sentiment with
          on-chain flow into one verdict.
        </motion.p>
      </motion.div>

      <motion.form
        variants={fadeUpSoft}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="relative mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            value={symbol}
            onChange={(e) => onSymbolChange(e.target.value.toUpperCase())}
            placeholder="Enter token symbol — try $SOL or $WIF"
            className="h-12 pl-11 text-base"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
          <Button
            type="submit"
            size="lg"
            disabled={isLoading || !symbol.trim()}
            className="h-12 w-full px-6 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Vibing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Vibe
              </>
            )}
          </Button>
        </motion.div>
      </motion.form>

      <motion.div
        variants={staggerContainer(0.05, 0.5)}
        initial="hidden"
        animate="show"
        className="relative mt-3 flex flex-wrap items-center gap-2 text-xs text-white/45"
      >
        <motion.span variants={fadeUpSoft} className="text-white/40">
          Try:
        </motion.span>
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s}
            variants={fadeUpSoft}
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleSuggestion(s)}
            type="button"
            className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-medium text-white/65 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
          >
            {s}
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {(text || isLoading || error) && (
          <motion.div
            key={analyzedSymbol ?? "stream"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="relative mt-6"
          >
            <div className="glass-soft relative overflow-hidden p-5">
              {isLoading && <div className="shimmer-bar" />}
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/40">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400/70 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
                  </span>
                  {isLoading ? "Streaming" : error ? "Error" : "Vibe Verdict"}
                </span>
                {analyzedSymbol && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-white/70">
                    ${analyzedSymbol}
                  </span>
                )}
              </div>

              {error ? (
                <p className="text-sm text-rose-300">{error}</p>
              ) : (
                <pre className="font-sans whitespace-pre-wrap break-words text-sm leading-relaxed text-white/85">
                  {renderMarkdownLite(text)}
                  {isLoading && <Caret />}
                </pre>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Caret() {
  return (
    <span
      className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-violet-300 align-middle"
      style={{ animation: "shimmer 1.1s steps(2, start) infinite" }}
    />
  );
}

function renderMarkdownLite(text: string): React.ReactNode {
  if (!text) return null;
  const lines = text.split("\n");

  return lines.map((line, idx) => {
    if (line.startsWith("## ")) {
      return (
        <span key={idx} className="block text-base font-semibold text-white">
          {line.replace(/^##\s+/, "")}
          {"\n"}
        </span>
      );
    }
    if (line.startsWith("### ")) {
      return (
        <span
          key={idx}
          className="mt-2 block text-[11px] uppercase tracking-[0.18em] text-white/45"
        >
          {line.replace(/^###\s+/, "")}
          {"\n"}
        </span>
      );
    }
    if (line.startsWith("> ")) {
      return (
        <span
          key={idx}
          className="block border-l-2 border-violet-400/40 pl-3 text-white/55"
        >
          {line.replace(/^>\s+/, "")}
          {"\n"}
        </span>
      );
    }
    if (line.startsWith("- ")) {
      return (
        <span key={idx} className="block pl-1 text-white/80">
          •&nbsp;{renderInline(line.slice(2))}
          {"\n"}
        </span>
      );
    }
    if (line.trim() === "") return <span key={idx}>{"\n"}</span>;
    return (
      <span key={idx}>
        {renderInline(line)}
        {"\n"}
      </span>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}
