import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, validateUIMessages, tool } from "ai";
import { requireEnv } from "@/lib/env";
import { buildSystemPrompt } from "@/modules/agent/system-prompt";
import { AGENT_MODEL } from "@/adapters/llm.openrouter";
import { PaymentIntentSchema } from "@/modules/agent/payment-intent";
import { assertWithinPolicy } from "@/modules/agent/policy";
import { buildExecutionPlan } from "@/modules/agent/execution-plan";

/**
 * Endpoint de chat: streaming bilingüe vía OpenRouter → Claude Sonnet 4.6.
 * Expone la tool `proposePayment`: cuando el usuario quiere pagar, el modelo la
 * llama y la UI muestra la tarjeta de confirmación con el fee real. La policy se
 * valida aquí (fail-loud) antes de proponer. Falla fuerte sin OPENROUTER_API_KEY.
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
    tools: {
      proposePayment: tool({
        description:
          "Propose a payment for the user to confirm. Call when the user wants to send money. / Propón un pago para que el usuario confirme.",
        inputSchema: PaymentIntentSchema,
        execute: async (intent) => {
          // Valida el límite de negocio antes de proponer (sin fallback).
          assertWithinPolicy(intent.amountUsd);
          const plan = buildExecutionPlan(intent);
          return {
            intent,
            feeUsd: plan.feeUsd,
            netUsd: plan.netUsd,
            feeBps: plan.feeBps,
            steps: plan.steps,
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
