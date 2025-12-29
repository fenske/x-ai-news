"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SentimentGauge } from "@/components/stock/sentiment-gauge";
import { PostFeed } from "@/components/stock/post-feed";
import { SkeletonGauge, SkeletonCard } from "@/components/ui/skeleton";
import { useSentiment } from "@/hooks/use-sentiment";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { formatNumber } from "@/lib/utils/format";
import { POPULAR_STOCKS } from "@/types/stock";

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();

  const { sentiment, isLoading, isError, refresh } = useSentiment(upperSymbol);
  const { isInWatchlist, addItem, removeItem } = useWatchlistStore();
  const inWatchlist = isInWatchlist(upperSymbol);

  const stockInfo = POPULAR_STOCKS.find((s) => s.symbol === upperSymbol);
  const stockName = stockInfo?.name || upperSymbol;

  const handleWatchlistToggle = () => {
    if (inWatchlist) {
      removeItem(upperSymbol);
    } else {
      addItem(upperSymbol, stockName);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ← Back
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-bold text-text-amber">
                ${upperSymbol}
              </h1>
              {stockInfo?.sector && (
                <Badge variant="default">{stockInfo.sector}</Badge>
              )}
            </div>
            <p className="text-text-secondary">{stockName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={refresh}>
            <RefreshIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant={inWatchlist ? "danger" : "primary"}
            size="sm"
            onClick={handleWatchlistToggle}
          >
            {inWatchlist ? (
              <>
                <MinusIcon className="w-4 h-4 mr-2" />
                Remove
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4 mr-2" />
                Watch
              </>
            )}
          </Button>
        </div>
      </div>

      {isError && (
        <Card className="p-6 border-bearish/30">
          <p className="text-bearish">
            Failed to load sentiment data. Make sure your XAI_API_KEY is
            configured in .env.local
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refresh}>
            Try Again
          </Button>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>Sentiment Overview</CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            {isLoading ? (
              <SkeletonGauge />
            ) : sentiment ? (
              <>
                <SentimentGauge
                  score={sentiment.overall.score}
                  size="lg"
                  showLabel
                  showChange
                  change={sentiment.momentum.sentimentShift}
                  animated
                />
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Confidence</span>
                    <span className="font-mono text-text-primary">
                      {Math.round(sentiment.overall.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Momentum</span>
                    <span
                      className={`font-mono ${
                        sentiment.momentum.direction === "accelerating"
                          ? "text-bullish"
                          : sentiment.momentum.direction === "decelerating"
                          ? "text-bearish"
                          : "text-text-primary"
                      }`}
                    >
                      {sentiment.momentum.direction}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-text-secondary">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="lg:col-span-2">
          <CardHeader>Key Metrics (24h)</CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-8 bg-terminal-elevated rounded animate-pulse" />
                    <div className="h-4 w-20 bg-terminal-elevated rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : sentiment ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard
                  label="Total Mentions"
                  value={formatNumber(sentiment.volumeMetrics.totalMentions)}
                />
                <MetricCard
                  label="Unique Authors"
                  value={formatNumber(sentiment.volumeMetrics.uniqueAuthors)}
                />
                <MetricCard
                  label="Influencer Mentions"
                  value={formatNumber(
                    sentiment.volumeMetrics.influencerMentions
                  )}
                />
                <MetricCard
                  label="Avg Engagement"
                  value={formatNumber(sentiment.volumeMetrics.avgEngagement)}
                />
              </div>
            ) : null}

            {/* Sentiment Breakdown */}
            {sentiment && (
              <div className="mt-6 pt-6 border-t border-terminal-border">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
                  Sentiment Breakdown
                </h3>
                <div className="flex h-4 rounded-full overflow-hidden bg-terminal-elevated">
                  <div
                    className="bg-bullish transition-all duration-500"
                    style={{ width: `${sentiment.breakdown.bullish}%` }}
                  />
                  <div
                    className="bg-neutral transition-all duration-500"
                    style={{ width: `${sentiment.breakdown.neutral}%` }}
                  />
                  <div
                    className="bg-bearish transition-all duration-500"
                    style={{ width: `${sentiment.breakdown.bearish}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs">
                  <span className="text-bullish">
                    Bullish {sentiment.breakdown.bullish}%
                  </span>
                  <span className="text-neutral">
                    Neutral {sentiment.breakdown.neutral}%
                  </span>
                  <span className="text-bearish">
                    Bearish {sentiment.breakdown.bearish}%
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Themes and Posts */}
      <Tabs defaultValue="themes">
        <TabsList>
          <TabsTrigger value="themes">Key Themes</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="themes">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : sentiment?.keyThemes && sentiment.keyThemes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sentiment.keyThemes.map((theme) => (
                    <ThemeCard key={theme.name} theme={theme} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-text-secondary py-8">
                  No themes detected
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <PostFeed posts={sentiment?.topPosts || []} symbol={upperSymbol} loading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-mono font-semibold text-text-primary">
        {value}
      </p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  );
}

function ThemeCard({
  theme,
}: {
  theme: { name: string; count: number; sentiment: string; examples: string[] };
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-text-amber">{theme.name}</span>
        <Badge
          variant={
            theme.sentiment === "bullish"
              ? "bullish"
              : theme.sentiment === "bearish"
              ? "bearish"
              : "neutral"
          }
          size="sm"
        >
          {theme.count}
        </Badge>
      </div>
      {theme.examples.length > 0 && (
        <p className="text-xs text-text-secondary line-clamp-2">
          &quot;{theme.examples[0]}&quot;
        </p>
      )}
    </Card>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
