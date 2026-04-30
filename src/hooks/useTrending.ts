"use client";

import { useQuery } from "@tanstack/react-query";

import type { TrendingApiResponse } from "@/app/api/trending/route";

const REFETCH_INTERVAL = 45_000;

async function fetchTrending(): Promise<TrendingApiResponse> {
  const res = await fetch(`/api/trending`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Trending fetch failed (${res.status})`);
  }
  return (await res.json()) as TrendingApiResponse;
}

export function useTrending() {
  return useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrending,
    refetchInterval: REFETCH_INTERVAL,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
    placeholderData: (prev) => prev,
  });
}
