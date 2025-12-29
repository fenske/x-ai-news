export type SentimentDirection = "bullish" | "bearish" | "neutral";

export interface SentimentScore {
  direction: SentimentDirection;
  score: number; // -100 to +100 (bearish to bullish)
  confidence: number; // 0-1
}

export interface Theme {
  name: string;
  count: number;
  sentiment: SentimentDirection;
  examples: string[];
}

export interface MomentumData {
  direction: "accelerating" | "decelerating" | "stable";
  velocityChange: number; // % change in mention velocity
  sentimentShift: number; // Change in sentiment score
  timeframe: string; // e.g., "1h", "24h"
}

export interface VolumeMetrics {
  totalMentions: number;
  uniqueAuthors: number;
  influencerMentions: number; // Accounts with >10k followers
  avgEngagement: number;
}

export interface SentimentBreakdown {
  bullish: number; // % of posts
  bearish: number;
  neutral: number;
}

export interface SentimentSnapshot {
  symbol: string;
  timestamp: Date;
  overall: SentimentScore;
  breakdown: SentimentBreakdown;
  volumeMetrics: VolumeMetrics;
  keyThemes: Theme[];
  topPosts: StockMention[];
  momentum: MomentumData;
  analyzedAt: Date;
}

export interface StockMention {
  id: string;
  symbol: string;
  postId: string;
  authorHandle: string;
  authorDisplayName: string;
  authorFollowers: number;
  authorVerified: boolean;
  content: string;
  timestamp: Date;
  engagement: {
    likes: number;
    reposts: number;
    replies: number;
  };
  sentiment: SentimentDirection;
  confidence: number;
  themes: string[];
  url: string;
}

export interface SentimentHistoryPoint {
  timestamp: Date;
  score: number;
  volume: number;
}

export type TimeRange = "1h" | "24h" | "7d" | "30d";
