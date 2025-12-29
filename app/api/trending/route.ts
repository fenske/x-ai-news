import { NextRequest, NextResponse } from "next/server";
import { searchTrendingStocks } from "@/lib/xai/x-search";
import {
  trendingCache,
  trendingCacheKey,
  CACHE_TTL,
} from "@/lib/cache/memory-cache";
import { apiRateLimiter } from "@/lib/xai/rate-limiter";
import type { TrendingStock } from "@/types/stock";
import type { APIResponse, APIError } from "@/types/api";

export async function GET(
  request: NextRequest
): Promise<NextResponse<APIResponse<TrendingStock[]> | APIError>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sector = searchParams.get("sector") || undefined;
    const forceRefresh = searchParams.get("refresh") === "true";

    // Check cache first
    const cacheKey = trendingCacheKey(sector);
    if (!forceRefresh) {
      const cached = trendingCache.get(cacheKey) as TrendingStock[] | null;
      if (cached) {
        return NextResponse.json({
          data: cached,
          meta: {
            cached: true,
            rateLimit: {
              remaining: apiRateLimiter.remaining(),
              resetAt: apiRateLimiter.resetTime().toISOString(),
            },
          },
        });
      }
    }

    // Fetch fresh data
    const result = await searchTrendingStocks();

    // Transform to TrendingStock type
    const trendingStocks: TrendingStock[] = result.stocks.map((stock) => ({
      symbol: stock.symbol,
      name: stock.name,
      mentions: stock.mentions,
      mentionChange: 0, // Would need historical data to calculate
      sentiment: stock.sentiment,
      sentimentChange: 0,
      topTheme: stock.topTheme,
      momentum: stock.momentum,
      isViral: stock.mentions > 1000,
      viralScore: Math.min(100, Math.floor(stock.mentions / 100)),
    }));

    // Filter by sector if provided
    const filtered = sector
      ? trendingStocks.filter((s) => s.sector === sector)
      : trendingStocks;

    // Cache the result
    trendingCache.set(cacheKey, filtered, CACHE_TTL.trending);

    return NextResponse.json({
      data: filtered,
      meta: {
        cached: false,
        rateLimit: {
          remaining: apiRateLimiter.remaining(),
          resetAt: apiRateLimiter.resetTime().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Trending API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch trending stocks. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
