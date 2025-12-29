import { createXai } from "@ai-sdk/xai";

// Lazily create the xai client to ensure environment variables are read at runtime
// (not at build time when they may not be available in Vercel)
let _xai: ReturnType<typeof createXai> | null = null;

export function getXai() {
  if (!_xai) {
    if (!process.env.XAI_API_KEY) {
      console.warn(
        "Warning: XAI_API_KEY is not set. API calls will fail. Add it to .env.local"
      );
    }
    _xai = createXai({
      apiKey: process.env.XAI_API_KEY || "",
      baseURL: "https://api.x.ai/v1",
    });
  }
  return _xai;
}

// Keep backward compatibility - but prefer using getXai() for guaranteed runtime access
export const xai = (model: string) => getXai()(model);

export const MODELS = {
  fast: "grok-2-1212",
  reasoning: "grok-2-1212",
  search: "grok-2-1212",
} as const;

export type ModelType = keyof typeof MODELS;
