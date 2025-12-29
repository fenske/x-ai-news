import { NextRequest, NextResponse } from "next/server";
import { analyzeStockSentiment } from "@/lib/xai/x-search";
import {
  sentimentCache,
  sentimentCacheKey,
  CACHE_TTL,
} from "@/lib/cache/memory-cache";
import { apiRateLimiter } from "@/lib/xai/rate-limiter";
import type { SentimentSnapshot, TimeRange } from "@/types/sentiment";
import type { APIResponse, APIError } from "@/types/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse<APIResponse<SentimentSnapshot> | APIError>> {
  try {
    const { symbol } = await params;
    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get("timeRange") as TimeRange) || "24h";
    const forceRefresh = searchParams.get("refresh") === "true";

    // Validate symbol
    const cleanSymbol = symbol.toUpperCase().replace(/[^A-Z0-9.]/g, "");
    if (!cleanSymbol || cleanSymbol.length > 10) {
      return NextResponse.json(
        {
          error: "Invalid stock symbol",
          code: "INVALID_SYMBOL",
        },
        { status: 400 }
      );
    }

    // Check cache first (unless force refresh)
    const cacheKey = sentimentCacheKey(cleanSymbol);
    if (!forceRefresh) {
      const cached = sentimentCache.get(cacheKey) as SentimentSnapshot | null;
      if (cached) {
        return NextResponse.json({
          data: cached,
          meta: {
            cached: true,
            cachedAt: cached.analyzedAt.toISOString(),
            rateLimit: {
              remaining: apiRateLimiter.remaining(),
              resetAt: apiRateLimiter.resetTime().toISOString(),
            },
          },
        });
      }
    }

    // Fetch fresh data
    const sentiment = await analyzeStockSentiment({
      symbol: cleanSymbol,
      timeRange: timeRange === "1h" || timeRange === "24h" || timeRange === "7d"
        ? timeRange
        : "24h",
    });

    // Cache the result
    sentimentCache.set(cacheKey, sentiment, CACHE_TTL.sentiment);

    return NextResponse.json({
      data: sentiment,
      meta: {
        cached: false,
        rateLimit: {
          remaining: apiRateLimiter.remaining(),
          resetAt: apiRateLimiter.resetTime().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Sentiment API error:", error);

    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again later.",
            code: "RATE_LIMITED",
          },
          { status: 429 }
        );
      }

      if (error.message.includes("unauthorized") || error.message.includes("API key")) {
        return NextResponse.json(
          {
            error: "API authentication failed. Check your XAI_API_KEY.",
            code: "UNAUTHORIZED",
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to analyze sentiment. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
