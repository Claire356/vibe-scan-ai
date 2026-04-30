"use client";

import * as React from "react";

interface VibeState {
  text: string;
  isLoading: boolean;
  error: string | null;
  symbol: string | null;
}

const INITIAL: VibeState = {
  text: "",
  isLoading: false,
  error: null,
  symbol: null,
};

export function useVibeAnalysis() {
  const [state, setState] = React.useState<VibeState>(INITIAL);
  const abortRef = React.useRef<AbortController | null>(null);

  const reset = React.useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  const analyze = React.useCallback(async (symbol: string) => {
    const trimmed = symbol.replace(/^\$/, "").trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      text: "",
      isLoading: true,
      error: null,
      symbol: trimmed.toUpperCase(),
    });

    try {
      const res = await fetch("/api/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setState((prev) => ({ ...prev, text: acc }));
      }
      acc += decoder.decode();
      setState((prev) => ({ ...prev, text: acc, isLoading: false }));
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: (err as Error).message,
      }));
    } finally {
      abortRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return { ...state, analyze, reset };
}
