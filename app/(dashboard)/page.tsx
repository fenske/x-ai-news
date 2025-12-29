"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SentimentGauge } from "@/components/stock/sentiment-gauge";
import { StockCard } from "@/components/stock/stock-card";
import { SkeletonCard, SkeletonGauge } from "@/components/ui/skeleton";
import { useTrending } from "@/hooks/use-trending";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useSentimentBatch } from "@/hooks/use-sentiment";
import Link from "next/link";

export default function DashboardPage() {
  const { stocks: trendingStocks, isLoading: trendingLoading } = useTrending();
  const watchlistItems = useWatchlistStore((state) => state.items);
  const watchlistSymbols = watchlistItems.map((item) => item.symbol);
  const { sentiments: watchlistSentiments, isLoading: watchlistLoading } =
    useSentimentBatch(watchlistSymbols.slice(0, 5));

  // Calculate overall market sentiment from trending stocks
  const marketSentiment =
    trendingStocks.length > 0
      ? Math.round(
          trendingStocks.reduce((acc, s) => acc + s.sentiment, 0) /
            trendingStocks.length
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time stock sentiment from X
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <RefreshIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Market Pulse Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>Market Pulse</CardHeader>
          <CardContent className="flex justify-center py-4">
            {trendingLoading ? (
              <SkeletonGauge />
            ) : (
              <SentimentGauge
                score={marketSentiment}
                size="lg"
                showLabel
                animated
              />
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader
            action={
              <Link
                href="/trending"
                className="text-xs text-text-amber hover:underline"
              >
                View all →
              </Link>
            }
          >
            Trending Now
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : trendingStocks.length > 0 ? (
              trendingStocks.slice(0, 5).map((stock, index) => (
                <div key={stock.symbol} className="flex items-center gap-3">
                  <span className="text-text-tertiary text-sm font-mono w-4">
                    {index + 1}
                  </span>
                  <StockCard
                    symbol={stock.symbol}
                    name={stock.name}
                    sentiment={stock.sentiment}
                    mentions={stock.mentions}
                    momentum={stock.momentum}
                    className="flex-1"
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-text-secondary py-8">
                No trending stocks found. Add your XAI_API_KEY to .env.local to
                enable real data.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Watchlist Section */}
      <Card>
        <CardHeader
          action={
            <Link
              href="/watchlist"
              className="text-xs text-text-amber hover:underline"
            >
              Manage watchlist →
            </Link>
          }
        >
          Your Watchlist
        </CardHeader>
        <CardContent>
          {watchlistItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-4">
                Your watchlist is empty
              </p>
              <Link href="/trending">
                <Button variant="secondary" size="sm">
                  Discover stocks to watch
                </Button>
              </Link>
            </div>
          ) : watchlistLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchlistSentiments.map((item) => (
                <StockCard
                  key={item.symbol}
                  symbol={item.symbol}
                  name={
                    watchlistItems.find((w) => w.symbol === item.symbol)
                      ?.name || item.symbol
                  }
                  sentiment={item.data?.overall.score || 0}
                  sparklineData={[40, 45, 42, 55, 60, 58, 62]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Trending Stocks"
          value={trendingStocks.length.toString()}
          icon={<TrendingIcon />}
        />
        <StatCard
          label="Watchlist Items"
          value={watchlistItems.length.toString()}
          icon={<WatchlistIcon />}
        />
        <StatCard
          label="Active Alerts"
          value="0"
          icon={<AlertIcon />}
        />
        <StatCard
          label="API Calls Remaining"
          value="50/50"
          icon={<ApiIcon />}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-terminal-elevated flex items-center justify-center text-text-amber">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-mono font-semibold text-text-primary">
            {value}
          </p>
          <p className="text-xs text-text-secondary">{label}</p>
        </div>
      </div>
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
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function WatchlistIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
