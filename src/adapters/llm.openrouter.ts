import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { requireEnv } from "@/lib/env";
import { PaymentIntentSchema, type PaymentIntent } from "@/modules/agent/payment-intent";
import { assertWithinPolicy } from "@/modules/agent/policy";
import { buildSystemPrompt } from "@/modules/agent/system-prompt";
import type { LLMPort } from "@/ports/llm.port";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const AGENT_MODEL = "anthropic/claude-sonnet-4.6";

/** Provider OpenRouter (OpenAI-compatible). Falla fuerte sin API key. */
function openRouter() {
  return createOpenAI({
    baseURL: OPENROUTER_BASE_URL,
    apiKey: requireEnv("OPENROUTER_API_KEY"),
  });
}

/**
 * Adapter de LLMPort sobre OpenRouter → Claude Sonnet 4.6. Usa generateObject
 * con el mismo schema Zod del dominio: el modelo interpreta en cualquier idioma
 * y el resultado se valida + se chequea contra la policy (fail-loud).
 */
export class OpenRouterLLMAdapter implements LLMPort {
  async interpret(message: string): Promise<PaymentIntent> {
    const provider = openRouter();
    const { object } = await generateObject({
      model: provider(AGENT_MODEL),
      schema: PaymentIntentSchema,
      system: buildSystemPrompt(),
      prompt: message,
    });
    // El schema ya validó la forma; falta el límite de negocio.
    assertWithinPolicy(object.amountUsd);
    return object;
  }
}
