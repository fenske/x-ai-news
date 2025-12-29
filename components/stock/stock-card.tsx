"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";
import { SentimentIndicator } from "./sentiment-gauge";
import { Sparkline } from "./sparkline";

interface StockCardProps {
  symbol: string;
  name?: string;
  sentiment: number;
  sparklineData?: number[];
  mentions?: number;
  momentum?: "accelerating" | "decelerating" | "stable";
  onClick?: () => void;
  className?: string;
}

export function StockCard({
  symbol,
  name,
  sentiment,
  sparklineData,
  mentions,
  momentum,
  onClick,
  className,
}: StockCardProps) {
  const content = (
    <Card
      hover
      glow
      className={cn(
        "p-4 cursor-pointer transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-text-amber">
              ${symbol}
            </span>
            {momentum && (
              <span
                className={cn(
                  "text-xs",
                  momentum === "accelerating" && "text-bullish",
                  momentum === "decelerating" && "text-bearish",
                  momentum === "stable" && "text-text-tertiary"
                )}
              >
                {momentum === "accelerating" && "↑"}
                {momentum === "decelerating" && "↓"}
                {momentum === "stable" && "→"}
              </span>
            )}
          </div>
          {name && (
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {name}
            </p>
          )}
          {mentions !== undefined && (
            <p className="text-xs text-text-tertiary mt-1">
              {mentions.toLocaleString()} mentions
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {sparklineData && sparklineData.length > 0 && (
            <Sparkline data={sparklineData} className="w-16 h-8" />
          )}
          <SentimentIndicator score={sentiment} />
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return content;
  }

  return (
    <Link href={`/stock/${symbol}`} className="block">
      {content}
    </Link>
  );
}
