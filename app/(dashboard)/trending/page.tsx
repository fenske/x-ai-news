"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StockCard } from "@/components/stock/stock-card";
import { SkeletonCard } from "@/components/ui/skeleton";
import { useTrending } from "@/hooks/use-trending";
import { SECTORS, type Sector } from "@/types/stock";

export default function TrendingPage() {
  const [selectedSector, setSelectedSector] = useState<Sector | "all">("all");
  const { stocks, isLoading, isError, refresh } = useTrending({
    sector: selectedSector === "all" ? undefined : selectedSector,
  });

  const viralStocks = stocks.filter((s) => s.isViral);
  const acceleratingStocks = stocks.filter(
    (s) => s.momentum === "accelerating"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">
            Trending Stocks
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Discover what&apos;s gaining momentum on X
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={refresh}>
          <RefreshIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Sector Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedSector === "all" ? "primary" : "ghost"}
          size="sm"
          onClick={() => setSelectedSector("all")}
        >
          All Sectors
        </Button>
        {SECTORS.map((sector) => (
          <Button
            key={sector}
            variant={selectedSector === sector ? "primary" : "ghost"}
            size="sm"
            onClick={() => setSelectedSector(sector)}
          >
            {sector}
          </Button>
        ))}
      </div>

      {isError && (
        <Card className="p-6 border-bearish/30">
          <p className="text-bearish">
            Failed to load trending stocks. Make sure your XAI_API_KEY is
            configured.
          </p>
        </Card>
      )}

      {/* Viral Stocks Section */}
      {viralStocks.length > 0 && (
        <Card>
          <CardHeader
            action={
              <Badge variant="warning" size="sm">
                {viralStocks.length} viral
              </Badge>
            }
          >
            <span className="flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-warning" />
              Going Viral
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {viralStocks.map((stock) => (
              <StockCard
                key={stock.symbol}
                symbol={stock.symbol}
                name={stock.name}
                sentiment={stock.sentiment}
                mentions={stock.mentions}
                momentum={stock.momentum}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Trending Table */}
      <Card>
        <CardHeader>All Trending Stocks</CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-terminal-border text-text-tertiary text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-2">#</th>
                    <th className="text-left py-3 px-2">Symbol</th>
                    <th className="text-left py-3 px-2 hidden md:table-cell">
                      Name
                    </th>
                    <th className="text-right py-3 px-2">Mentions</th>
                    <th className="text-right py-3 px-2">Sentiment</th>
                    <th className="text-center py-3 px-2">Momentum</th>
                    <th className="text-left py-3 px-2 hidden lg:table-cell">
                      Top Theme
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/50">
                  {stocks.map((stock, index) => (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-terminal-elevated transition-colors cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/stock/${stock.symbol}`)
                      }
                    >
                      <td className="py-3 px-2 text-text-tertiary">
                        {index + 1}
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-text-amber">
                          ${stock.symbol}
                        </span>
                        {stock.isViral && (
                          <FireIcon className="w-4 h-4 text-warning inline ml-1" />
                        )}
                      </td>
                      <td className="py-3 px-2 text-text-secondary hidden md:table-cell">
                        {stock.name}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {stock.mentions.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span
                          className={
                            stock.sentiment > 20
                              ? "text-bullish"
                              : stock.sentiment < -20
                              ? "text-bearish"
                              : "text-neutral"
                          }
                        >
                          {stock.sentiment > 0 ? "+" : ""}
                          {stock.sentiment}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <MomentumIndicator momentum={stock.momentum} />
                      </td>
                      <td className="py-3 px-2 hidden lg:table-cell">
                        <Badge variant="default" size="sm">
                          {stock.topTheme}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-text-secondary py-8">
              No trending stocks found. Configure your XAI_API_KEY to enable
              real data.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Momentum Shifts */}
      {acceleratingStocks.length > 0 && (
        <Card>
          <CardHeader>Momentum Accelerating</CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acceleratingStocks.slice(0, 6).map((stock) => (
              <StockCard
                key={stock.symbol}
                symbol={stock.symbol}
                name={stock.name}
                sentiment={stock.sentiment}
                momentum={stock.momentum}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MomentumIndicator({
  momentum,
}: {
  momentum: "accelerating" | "decelerating" | "stable";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        momentum === "accelerating"
          ? "text-bullish"
          : momentum === "decelerating"
          ? "text-bearish"
          : "text-text-tertiary"
      }`}
    >
      {momentum === "accelerating" && "↑"}
      {momentum === "decelerating" && "↓"}
      {momentum === "stable" && "→"}
      <span className="hidden sm:inline">{momentum}</span>
    </span>
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

function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.692 1.486-5.057 3.5-6.5-.5 1.5.5 3 2 3.5-1-2-1-4 1-6 .5 1 1.5 2 2.5 2.5-1-2 1-4 3-5 0 2 1 3.5 2 5 .5-.5 1-2 1-3 2 2.5 3 5 3 7 0 3.866-3.134 7-7 7z" />
    </svg>
  );
}
