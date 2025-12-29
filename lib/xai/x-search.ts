import { generateText } from "ai";
import { xai, MODELS } from "./client";
import { apiRateLimiter } from "./rate-limiter";
import type {
  SentimentSnapshot,
  SentimentDirection,
  StockMention,
  Theme,
} from "@/types/sentiment";

interface XSearchOptions {
  symbol: string;
  timeRange?: "1h" | "24h" | "7d";
  maxResults?: number;
}

function getFromDate(timeRange: "1h" | "24h" | "7d"): string {
  const now = new Date();
  switch (timeRange) {
    case "1h":
      now.setHours(now.getHours() - 1);
      break;
    case "24h":
      now.setDate(now.getDate() - 1);
      break;
    case "7d":
      now.setDate(now.getDate() - 7);
      break;
  }
  return now.toISOString().split("T")[0];
}

const SENTIMENT_ANALYSIS_PROMPT = `You are a financial sentiment analyst. Analyze the following X/Twitter posts about the stock symbol and provide a comprehensive sentiment analysis.

For each analysis, you must return a JSON object with the following structure:
{
  "overall": {
    "direction": "bullish" | "bearish" | "neutral",
    "score": number (-100 to 100, where -100 is extremely bearish and 100 is extremely bullish),
    "confidence": number (0 to 1)
  },
  "breakdown": {
    "bullish": number (percentage 0-100),
    "bearish": number (percentage 0-100),
    "neutral": number (percentage 0-100)
  },
  "volumeMetrics": {
    "totalMentions": number,
    "uniqueAuthors": number,
    "influencerMentions": number (authors with >10k implied followers),
    "avgEngagement": number
  },
  "keyThemes": [
    {
      "name": string (e.g., "earnings", "AI", "growth", "product launch"),
      "count": number,
      "sentiment": "bullish" | "bearish" | "neutral",
      "examples": [string] (2-3 short quotes)
    }
  ],
  "topPosts": [
    {
      "id": string,
      "authorHandle": string,
      "authorDisplayName": string,
      "authorFollowers": number (estimate),
      "authorVerified": boolean,
      "content": string,
      "engagement": { "likes": number, "reposts": number, "replies": number },
      "sentiment": "bullish" | "bearish" | "neutral",
      "confidence": number,
      "themes": [string]
    }
  ],
  "momentum": {
    "direction": "accelerating" | "decelerating" | "stable",
    "velocityChange": number (percentage),
    "sentimentShift": number,
    "timeframe": string
  },
  "redFlags": [
    {
      "type": "pump_and_dump" | "coordinated_activity" | "bot_activity" | "misleading_claims",
      "description": string,
      "confidence": number
    }
  ]
}

Be objective and data-driven. Look for:
1. Overall sentiment from genuine discussions
2. Key themes and catalysts being discussed
3. Influential voices and their positions
4. Signs of manipulation or coordinated activity
5. Momentum changes in discussion volume or sentiment

Return ONLY valid JSON, no markdown or explanations.`;

export async function analyzeStockSentiment(
  options: XSearchOptions
): Promise<SentimentSnapshot> {
  const { symbol, timeRange = "24h" } = options;

  // Rate limiting
  await apiRateLimiter.acquire();

  const fromDate = getFromDate(timeRange);
  const toDate = new Date().toISOString().split("T")[0];

  try {
    const { text } = await generateText({
      model: xai(MODELS.search),
      prompt: `Search X/Twitter for recent posts about the stock $${symbol.toUpperCase()} from ${fromDate} to ${toDate}.

Focus on:
- Investor sentiment and opinions
- News and catalyst discussions
- Price predictions and analysis
- Any red flags or concerns

${SENTIMENT_ANALYSIS_PROMPT}

Stock symbol to analyze: $${symbol.toUpperCase()}`,
    });

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse sentiment analysis response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Transform to our SentimentSnapshot type
    const snapshot: SentimentSnapshot = {
      symbol: symbol.toUpperCase(),
      timestamp: new Date(),
      overall: {
        direction: analysis.overall?.direction || "neutral",
        score: analysis.overall?.score || 0,
        confidence: analysis.overall?.confidence || 0.5,
      },
      breakdown: {
        bullish: analysis.breakdown?.bullish || 33,
        bearish: analysis.breakdown?.bearish || 33,
        neutral: analysis.breakdown?.neutral || 34,
      },
      volumeMetrics: {
        totalMentions: analysis.volumeMetrics?.totalMentions || 0,
        uniqueAuthors: analysis.volumeMetrics?.uniqueAuthors || 0,
        influencerMentions: analysis.volumeMetrics?.influencerMentions || 0,
        avgEngagement: analysis.volumeMetrics?.avgEngagement || 0,
      },
      keyThemes: (analysis.keyThemes || []).map(
        (t: { name: string; count: number; sentiment: SentimentDirection; examples: string[] }) => ({
          name: t.name,
          count: t.count || 0,
          sentiment: t.sentiment || "neutral",
          examples: t.examples || [],
        })
      ) as Theme[],
      topPosts: (analysis.topPosts || []).map(
        (p: {
          id?: string;
          authorHandle?: string;
          authorDisplayName?: string;
          authorFollowers?: number;
          authorVerified?: boolean;
          content?: string;
          engagement?: { likes?: number; reposts?: number; replies?: number };
          sentiment?: SentimentDirection;
          confidence?: number;
          themes?: string[];
        }, idx: number) => ({
          id: p.id || `post-${idx}`,
          symbol: symbol.toUpperCase(),
          postId: p.id || `post-${idx}`,
          authorHandle: p.authorHandle || "unknown",
          authorDisplayName: p.authorDisplayName || p.authorHandle || "Unknown",
          authorFollowers: p.authorFollowers || 0,
          authorVerified: p.authorVerified || false,
          content: p.content || "",
          timestamp: new Date(),
          engagement: {
            likes: p.engagement?.likes || 0,
            reposts: p.engagement?.reposts || 0,
            replies: p.engagement?.replies || 0,
          },
          sentiment: p.sentiment || "neutral",
          confidence: p.confidence || 0.5,
          themes: p.themes || [],
          // Note: AI-generated posts don't have real X post IDs, so we link to search instead
          url: "",
        })
      ) as StockMention[],
      momentum: {
        direction: analysis.momentum?.direction || "stable",
        velocityChange: analysis.momentum?.velocityChange || 0,
        sentimentShift: analysis.momentum?.sentimentShift || 0,
        timeframe: timeRange,
      },
      analyzedAt: new Date(),
    };

    return snapshot;
  } catch (error) {
    console.error("Error analyzing stock sentiment:", error);
    throw error;
  }
}

export async function searchTrendingStocks(): Promise<{
  stocks: Array<{
    symbol: string;
    name: string;
    mentions: number;
    sentiment: number;
    momentum: "accelerating" | "decelerating" | "stable";
    topTheme: string;
  }>;
}> {
  await apiRateLimiter.acquire();

  try {
    const { text } = await generateText({
      model: xai(MODELS.search),
      prompt: `Search X/Twitter for the most discussed stocks in the last 24 hours. Identify stocks that are:
1. Trending with high mention volume
2. Experiencing significant sentiment shifts
3. Being discussed by influential accounts

Return a JSON array of the top 10 trending stocks with this structure:
{
  "stocks": [
    {
      "symbol": string,
      "name": string,
      "mentions": number (estimated),
      "sentiment": number (-100 to 100),
      "momentum": "accelerating" | "decelerating" | "stable",
      "topTheme": string (main topic being discussed)
    }
  ]
}

Return ONLY valid JSON, no markdown or explanations.`,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse trending stocks response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error fetching trending stocks:", error);
    throw error;
  }
}
