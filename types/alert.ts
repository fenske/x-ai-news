import type { StockMention, SentimentDirection } from "./sentiment";

export type AlertSeverity = "critical" | "warning" | "info";

export type AlertType =
  | "sentiment_spike"
  | "volume_surge"
  | "influencer_mention"
  | "red_flag"
  | "momentum_shift"
  | "viral_detection";

export interface Alert {
  id: string;
  symbol: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metrics?: {
    before: number;
    after: number;
    changePercent: number;
  };
  triggerPost?: StockMention;
  createdAt: Date;
  expiresAt: Date;
  acknowledged: boolean;
}

export type RedFlagType =
  | "pump_and_dump"
  | "coordinated_activity"
  | "bot_activity"
  | "misleading_claims"
  | "unusual_pattern"
  | "insider_selling"
  | "accounting_concerns";

export interface RedFlag {
  id: string;
  symbol: string;
  type: RedFlagType;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string[];
  detectedAt: Date;
  confidence: number; // 0-1
  sourcePosts?: StockMention[];
}

export interface AlertConfig {
  symbol: string;
  enabled: boolean;
  thresholds: {
    sentimentDropPercent?: number; // Alert if sentiment drops by this %
    volumeSpikePercent?: number; // Alert if volume spikes by this %
    influencerMention?: boolean; // Alert on influencer mentions
    redFlags?: boolean; // Alert on red flags
  };
}

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  sentiment_spike: "Sentiment Spike",
  volume_surge: "Volume Surge",
  influencer_mention: "Influencer Mention",
  red_flag: "Red Flag",
  momentum_shift: "Momentum Shift",
  viral_detection: "Going Viral",
};

export const RED_FLAG_LABELS: Record<RedFlagType, string> = {
  pump_and_dump: "Pump & Dump Risk",
  coordinated_activity: "Coordinated Activity",
  bot_activity: "Bot Activity",
  misleading_claims: "Misleading Claims",
  unusual_pattern: "Unusual Pattern",
  insider_selling: "Insider Selling",
  accounting_concerns: "Accounting Concerns",
};

export const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; color: string }
> = {
  critical: { label: "Critical", color: "critical" },
  warning: { label: "Warning", color: "warning" },
  info: { label: "Info", color: "info" },
};
