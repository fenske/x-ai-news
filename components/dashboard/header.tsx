"use client";

import { StockSearch } from "@/components/stock/stock-search";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  alertCount?: number;
}

export function Header({ alertCount = 0 }: HeaderProps) {
  return (
    <header className="h-16 border-b border-terminal-border bg-terminal-surface/80 backdrop-blur-sm flex items-center px-6 gap-4">
      <div className="flex-1 max-w-xl">
        <StockSearch placeholder="Search stocks... (e.g., AAPL, TSLA)" />
      </div>

      <div className="flex items-center gap-4">
        {/* Market Status */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
          <span className="text-text-secondary">Market Open</span>
        </div>

        {/* Alerts indicator */}
        {alertCount > 0 && (
          <Badge variant="warning" size="md">
            {alertCount} alert{alertCount !== 1 ? "s" : ""}
          </Badge>
        )}

        {/* Keyboard shortcut hint */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-text-tertiary">
          <kbd className="px-1.5 py-0.5 bg-terminal-elevated border border-terminal-border rounded text-[10px]">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 bg-terminal-elevated border border-terminal-border rounded text-[10px]">
            K
          </kbd>
          <span className="ml-1">to search</span>
        </div>
      </div>
    </header>
  );
}
