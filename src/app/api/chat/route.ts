import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, validateUIMessages } from "ai";
import { requireEnv } from "@/lib/env";
import { buildSystemPrompt } from "@/modules/agent/system-prompt";
import { AGENT_MODEL } from "@/adapters/llm.openrouter";

/**
 * Endpoint de chat: streaming bilingüe vía OpenRouter → Claude Sonnet 4.6.
 * El system prompt lleva la policy real. Falla fuerte sin OPENROUTER_API_KEY.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const messages = await validateUIMessages({ messages: body.messages });

  const provider = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: requireEnv("OPENROUTER_API_KEY"),
  });

  const result = streamText({
    model: provider(AGENT_MODEL),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
