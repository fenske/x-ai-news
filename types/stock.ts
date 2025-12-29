export interface Stock {
  symbol: string;
  name: string;
  sector?: string;
  marketCapCategory?: "small" | "mid" | "large" | "mega";
  lastPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

export interface TrendingStock extends Stock {
  mentions: number;
  mentionChange: number; // % change from previous period
  sentiment: number; // -100 to +100
  sentimentChange: number;
  topTheme: string;
  momentum: "accelerating" | "decelerating" | "stable";
  isViral: boolean;
  viralScore?: number; // 0-100
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  sector?: string;
  exchange?: string;
}

export const SECTORS = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer",
  "Industrial",
  "Communications",
  "Utilities",
  "Real Estate",
  "Materials",
] as const;

export type Sector = (typeof SECTORS)[number];

export const POPULAR_STOCKS: StockSearchResult[] = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Finance" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance" },
  { symbol: "V", name: "Visa Inc.", sector: "Finance" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer" },
  { symbol: "MA", name: "Mastercard", sector: "Finance" },
  { symbol: "HD", name: "Home Depot", sector: "Consumer" },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy" },
  { symbol: "MRK", name: "Merck & Co.", sector: "Healthcare" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communications" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology" },
  { symbol: "PLTR", name: "Palantir Technologies", sector: "Technology" },
  { symbol: "MSTR", name: "MicroStrategy", sector: "Technology" },
  { symbol: "COIN", name: "Coinbase Global", sector: "Finance" },
  { symbol: "GME", name: "GameStop Corp.", sector: "Consumer" },
  { symbol: "AMC", name: "AMC Entertainment", sector: "Communications" },
];
