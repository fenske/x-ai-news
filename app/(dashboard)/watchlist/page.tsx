"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/stock/stock-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { StockSearch } from "@/components/stock/stock-search";
import { useWatchlistStore } from "@/stores/watchlist-store";
import { useSentimentBatch } from "@/hooks/use-sentiment";
import { POPULAR_STOCKS } from "@/types/stock";
import { formatRelativeTime } from "@/lib/utils/format";
import Link from "next/link";

export default function WatchlistPage() {
  const { items, removeItem, toggleAlerts, addItem } = useWatchlistStore();
  const symbols = items.map((item) => item.symbol);
  const { sentiments, isLoading } = useSentimentBatch(symbols);

  const handleAddStock = (symbol: string) => {
    const stockInfo = POPULAR_STOCKS.find(
      (s) => s.symbol === symbol.toUpperCase()
    );
    addItem(symbol, stockInfo?.name || symbol);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Your Watchlist
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Track and monitor your favorite stocks
          </p>
        </div>
      </div>

      {/* Add Stock */}
      <Card>
        <CardHeader>Add Stock</CardHeader>
        <CardContent>
          <StockSearch
            onSelect={handleAddStock}
            placeholder="Search for a stock to add..."
          />
        </CardContent>
      </Card>

      {/* Watchlist Items */}
      <Card>
        <CardHeader
          action={
            items.length > 0 && (
              <span className="text-xs text-text-secondary">
                {items.length} stock{items.length !== 1 ? "s" : ""}
              </span>
            )
          }
        >
          Watchlist
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <WatchlistEmptyIcon className="w-16 h-16 text-text-tertiary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Your watchlist is empty
              </h3>
              <p className="text-text-secondary mb-6">
                Add stocks to track their sentiment and receive alerts
              </p>
              <Link href="/trending">
                <Button variant="primary">Discover Trending Stocks</Button>
              </Link>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {items.map((item) => (
                <SkeletonCard key={item.symbol} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-terminal-border">
              {items.map((item) => {
                const sentimentData = sentiments.find(
                  (s) => s.symbol === item.symbol
                );
                return (
                  <div
                    key={item.symbol}
                    className="py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <StockCard
                          symbol={item.symbol}
                          name={item.name}
                          sentiment={sentimentData?.data?.overall.score || 0}
                          sparklineData={[40, 45, 42, 55, 60, 58, 62]}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={item.alertsEnabled ? "secondary" : "ghost"}
                          size="sm"
                          onClick={() => toggleAlerts(item.symbol)}
                          title={
                            item.alertsEnabled
                              ? "Alerts enabled"
                              : "Alerts disabled"
                          }
                        >
                          <BellIcon
                            className={`w-4 h-4 ${
                              item.alertsEnabled
                                ? "text-amber-500"
                                : "text-text-tertiary"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.symbol)}
                          title="Remove from watchlist"
                        >
                          <TrashIcon className="w-4 h-4 text-bearish" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 ml-4 text-xs text-text-tertiary">
                      Added {formatRelativeTime(new Date(item.addedAt))}
                      {item.notes && (
                        <span className="ml-2">• {item.notes}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {items.length > 0 && (
        <Card>
          <CardHeader>Quick Actions</CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export Watchlist
            </Button>
            <Button variant="secondary" size="sm">
              <ShareIcon className="w-4 h-4 mr-2" />
              Share
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function WatchlistEmptyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
