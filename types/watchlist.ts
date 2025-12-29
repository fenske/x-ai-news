export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: Date;
  notes?: string;
  alertsEnabled: boolean;
  thresholds?: {
    sentimentDropPercent?: number;
    volumeSpikePercent?: number;
  };
}

export interface Watchlist {
  items: WatchlistItem[];
  updatedAt: Date;
}
