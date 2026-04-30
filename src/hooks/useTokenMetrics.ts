"use client";

import { useQuery } from "@tanstack/react-query";

import type { TokenApiResponse } from "@/app/api/token/[symbol]/route";

const REFETCH_INTERVAL = 30_000;

async function fetchToken(symbol: string): Promise<TokenApiResponse> {
  const res = await fetch(`/api/token/${encodeURIComponent(symbol)}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Token fetch failed (${res.status})`);
  }
  return (await res.json()) as TokenApiResponse;
}

export function useTokenMetrics(symbol: string) {
  return useQuery({
    queryKey: ["token", symbol],
    queryFn: () => fetchToken(symbol),
    enabled: Boolean(symbol),
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });
}
