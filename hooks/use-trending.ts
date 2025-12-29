"use client";

import useSWR from "swr";
import type { TrendingStock } from "@/types/stock";
import type { APIResponse } from "@/types/api";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch trending stocks");
  }
  return res.json();
};

interface UseTrendingOptions {
  sector?: string;
  refreshInterval?: number;
}

export function useTrending(options: UseTrendingOptions = {}) {
  const { sector, refreshInterval = 120000 } = options;

  const url = sector
    ? `/api/trending?sector=${encodeURIComponent(sector)}`
    : "/api/trending";

  const { data, error, isLoading, mutate } = useSWR<
    APIResponse<TrendingStock[]>
  >(url, fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
    dedupingInterval: 60000,
  });

  return {
    stocks: data?.data || [],
    meta: data?.meta,
    isLoading,
    isError: !!error,
    error: error?.message,
    refresh: () => mutate(),
  };
}
