"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WatchlistItem } from "@/types/watchlist";

interface WatchlistStore {
  items: WatchlistItem[];
  addItem: (symbol: string, name: string) => void;
  removeItem: (symbol: string) => void;
  updateItem: (symbol: string, updates: Partial<WatchlistItem>) => void;
  isInWatchlist: (symbol: string) => boolean;
  toggleAlerts: (symbol: string) => void;
}

export const useWatchlistStore = create<WatchlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (symbol: string, name: string) => {
        const items = get().items;
        if (items.some((item) => item.symbol === symbol)) return;

        set({
          items: [
            ...items,
            {
              symbol: symbol.toUpperCase(),
              name,
              addedAt: new Date(),
              alertsEnabled: true,
            },
          ],
        });
      },

      removeItem: (symbol: string) => {
        set({
          items: get().items.filter(
            (item) => item.symbol !== symbol.toUpperCase()
          ),
        });
      },

      updateItem: (symbol: string, updates: Partial<WatchlistItem>) => {
        set({
          items: get().items.map((item) =>
            item.symbol === symbol.toUpperCase() ? { ...item, ...updates } : item
          ),
        });
      },

      isInWatchlist: (symbol: string) => {
        return get().items.some(
          (item) => item.symbol === symbol.toUpperCase()
        );
      },

      toggleAlerts: (symbol: string) => {
        const item = get().items.find(
          (i) => i.symbol === symbol.toUpperCase()
        );
        if (item) {
          get().updateItem(symbol, { alertsEnabled: !item.alertsEnabled });
        }
      },
    }),
    {
      name: "watchlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
