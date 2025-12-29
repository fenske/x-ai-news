import { createXai } from "@ai-sdk/xai";

if (!process.env.XAI_API_KEY) {
  console.warn(
    "Warning: XAI_API_KEY is not set. API calls will fail. Add it to .env.local"
  );
}

export const xai = createXai({
  apiKey: process.env.XAI_API_KEY || "",
  baseURL: "https://api.x.ai/v1",
});

export const MODELS = {
  fast: "grok-2-1212",
  reasoning: "grok-2-1212",
  search: "grok-2-1212",
} as const;

export type ModelType = keyof typeof MODELS;
