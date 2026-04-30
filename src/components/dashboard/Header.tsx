"use client";

import { motion } from "framer-motion";
import { Activity, Sparkles } from "lucide-react";

import { ConnectWallet } from "@/components/dashboard/ConnectWallet";
import { easeOut } from "@/lib/motion";

const nav = [
  { label: "Dashboard", active: true },
  { label: "Watchlist" },
  { label: "Alerts" },
  { label: "Reports" },
];

export function Header() {
  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: easeOut }}
      className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#04060d]/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              delay: 0.15,
              type: "spring",
              stiffness: 240,
              damping: 18,
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c5cff] via-[#5b8dff] to-[#22d3ee] shadow-[0_8px_30px_-8px_rgba(124,92,255,0.7)]"
          >
            <motion.span
              aria-hidden
              animate={{
                opacity: [0.55, 0.95, 0.55],
                scale: [1, 1.18, 1],
              }}
              transition={{
                duration: 3.4,
                ease: "easeInOut",
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7c5cff] via-[#5b8dff] to-[#22d3ee] blur-md"
            />
            <Sparkles
              className="relative z-10 h-4 w-4 text-white"
              strokeWidth={2.5}
            />
            <span className="absolute -bottom-1 -right-1 z-10 inline-flex h-3 w-3 items-center justify-center">
              <span className="pulse-dot inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-white">
              VibeScan
              <span className="ml-1 text-gradient">AI</span>
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-white/40">
              On-chain Vibe Intelligence
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 backdrop-blur md:flex">
          {nav.map((item) => (
            <button
              key={item.label}
              type="button"
              className={
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition " +
                (item.active
                  ? "bg-white/[0.08] text-white"
                  : "text-white/55 hover:text-white")
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/70 lg:flex">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Markets live</span>
          </div>
          <ConnectWallet />
        </div>
      </div>
    </motion.header>
  );
}
