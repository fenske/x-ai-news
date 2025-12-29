"use client";

import useSWR from "swr";
import type { SentimentSnapshot, TimeRange } from "@/types/sentiment";
import type { APIResponse } from "@/types/api";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch sentiment");
  }
  return res.json();
};

interface UseSentimentOptions {
  timeRange?: TimeRange;
  refreshInterval?: number;
  enabled?: boolean;
}

export function useSentiment(
  symbol: string | null,
  options: UseSentimentOptions = {}
) {
  const { timeRange = "24h", refreshInterval = 60000, enabled = true } = options;

  const { data, error, isLoading, mutate } = useSWR<
    APIResponse<SentimentSnapshot>
  >(
    enabled && symbol ? `/api/sentiment/${symbol}?timeRange=${timeRange}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      dedupingInterval: 30000,
    }
  );

  return {
    sentiment: data?.data || null,
    meta: data?.meta,
    isLoading,
    isError: !!error,
    error: error?.message,
    refresh: () => mutate(),
  };
}

export function useSentimentBatch(symbols: string[]) {
  // For multiple symbols, we use parallel requests
  const results = symbols.map((symbol) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR<APIResponse<SentimentSnapshot>>(
      `/api/sentiment/${symbol}`,
      fetcher,
      {
        refreshInterval: 120000, // 2 minutes for batch
        dedupingInterval: 60000,
      }
    );
  });

  const sentiments = results.map((r, i) => ({
    symbol: symbols[i],
    data: r.data?.data || null,
    isLoading: r.isLoading,
    error: r.error,
  }));

  const isLoading = results.some((r) => r.isLoading);
  const hasError = results.some((r) => r.error);

  return {
    sentiments,
    isLoading,
    hasError,
  };
}
