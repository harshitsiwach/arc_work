/**
 * OpenAI client - lazy initialization to avoid build-time crashes
 */
import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
      maxRetries: 3,
      timeout: 60_000,
    });
  }
  return client;
}
