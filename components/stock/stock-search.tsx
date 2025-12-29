"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/input";
import { POPULAR_STOCKS, type StockSearchResult } from "@/types/stock";

interface StockSearchProps {
  onSelect?: (symbol: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function StockSearch({
  onSelect,
  placeholder = "Search stocks (e.g., AAPL, TSLA)...",
  autoFocus = false,
  className,
}: StockSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) {
      return POPULAR_STOCKS.slice(0, 8);
    }

    const q = query.toUpperCase().trim();
    return POPULAR_STOCKS.filter(
      (stock) =>
        stock.symbol.includes(q) ||
        stock.name.toUpperCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const handleSelect = useCallback(
    (symbol: string) => {
      if (onSelect) {
        onSelect(symbol);
      } else {
        router.push(`/stock/${symbol}`);
      }
      setQuery("");
      setIsOpen(false);
    },
    [onSelect, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelect(results[selectedIndex].symbol);
          } else if (query.trim()) {
            handleSelect(query.trim().toUpperCase());
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, results, selectedIndex, handleSelect, query]
  );

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        icon={<SearchIcon className="w-4 h-4" />}
        clearable
        onClear={() => setQuery("")}
      />

      {isOpen && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 bg-terminal-surface border border-terminal-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="p-1">
            {!query.trim() && (
              <div className="px-3 py-1.5 text-xs text-text-tertiary uppercase tracking-wider">
                Popular Stocks
              </div>
            )}
            {results.map((stock, index) => (
              <button
                key={stock.symbol}
                onClick={() => handleSelect(stock.symbol)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors",
                  index === selectedIndex
                    ? "bg-terminal-elevated"
                    : "hover:bg-terminal-elevated/50"
                )}
              >
                <span className="font-mono font-semibold text-text-amber">
                  ${stock.symbol}
                </span>
                <span className="text-sm text-text-secondary truncate flex-1">
                  {stock.name}
                </span>
                {stock.sector && (
                  <span className="text-xs text-text-tertiary">
                    {stock.sector}
                  </span>
                )}
              </button>
            ))}
          </div>
          {query.trim() && (
            <div className="border-t border-terminal-border p-2">
              <button
                onClick={() => handleSelect(query.trim().toUpperCase())}
                className="w-full px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-terminal-elevated rounded-md text-left transition-colors"
              >
                Search for &quot;{query.trim().toUpperCase()}&quot; →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
