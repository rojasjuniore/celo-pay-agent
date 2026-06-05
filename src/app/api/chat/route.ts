import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, validateUIMessages, tool } from "ai";
import { z } from "zod";
import { requireEnv } from "@/lib/env";
import { buildSystemPrompt } from "@/modules/agent/system-prompt";
import { AGENT_MODEL } from "@/adapters/llm.openrouter";
import { PaymentIntentSchema } from "@/modules/agent/payment-intent";
import { assertWithinPolicy } from "@/modules/agent/policy";
import { buildExecutionPlan } from "@/modules/agent/execution-plan";
import { getFeeBps } from "@/modules/revenue/fee";
import { getPaymentRecords } from "@/lib/db/reports";
import { spendingSummary, byCategory, byRecipient, type PaymentRecord } from "@/modules/reporting/summary";
import { CATEGORY_LABELS } from "@/modules/reporting/category";
import { walletFromSession } from "@/lib/session";

/**
 * Endpoint de chat: streaming bilingüe vía OpenRouter → Claude Sonnet 4.6.
 * Remi tiene tools de PAGO (proposePayment) y CONTABLES (summary, categorías,
 * historial). Las contables operan solo sobre los datos del usuario (la wallet
 * llega en el body). Devuelven datos reales de la DB; el LLM solo los presenta.
 */
const PERIOD_DAYS: Record<string, number> = { week: 7, month: 30, quarter: 90, year: 365 };

function periodRange(period: string): { fromMs: number; toMs: number } {
  const toMs = Date.parse(new Date().toISOString());
  const days = PERIOD_DAYS[period] ?? 30;
  return { fromMs: toMs - days * 24 * 60 * 60 * 1000, toMs };
}

function readCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const messages = await validateUIMessages({ messages: body.messages });
  // Identidad SOLO de la sesión verificada (cookie), nunca del body → sin IDOR.
  const wallet = await walletFromSession(readCookie(request, "remi_session"));

  const provider = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: requireEnv("OPENROUTER_API_KEY"),
  });

  // Carga los registros del usuario una vez (si hay wallet) para las tools.
  async function records(period: string): Promise<PaymentRecord[]> {
    if (!wallet) return [];
    const { fromMs, toMs } = periodRange(period);
    return getPaymentRecords(wallet, fromMs, toMs);
  }

  const result = streamText({
    model: provider(AGENT_MODEL),
    system: buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: {
      proposePayment: tool({
        description:
          "Propose a payment for the user to confirm. Call when the user wants to send money.",
        inputSchema: PaymentIntentSchema,
        execute: async (intent) => {
          assertWithinPolicy(intent.amountUsd);
          const plan = buildExecutionPlan(intent);
          return { intent, feeUsd: plan.feeUsd, netUsd: plan.netUsd, feeBps: plan.feeBps, steps: plan.steps };
        },
      }),

      getSpendingSummary: tool({
        description:
          "Get the user's spending summary (total, count, fees, top recipient) for a period. Use when they ask how much they spent.",
        inputSchema: z.object({ period: z.enum(["week", "month", "quarter", "year"]).default("month") }),
        execute: async ({ period }) => {
          if (!wallet) return { error: "not signed in" };
          const s = spendingSummary(await records(period), getFeeBps());
          return { period, ...s };
        },
      }),

      getCategoryBreakdown: tool({
        description: "Get the user's spending grouped by category for a period.",
        inputSchema: z.object({ period: z.enum(["week", "month", "quarter", "year"]).default("month") }),
        execute: async ({ period }) => {
          if (!wallet) return { error: "not signed in" };
          const breakdown = byCategory(await records(period)).map((c) => ({
            category: CATEGORY_LABELS[c.category],
            totalUsd: c.totalUsd,
          }));
          return { period, breakdown };
        },
      }),

      listTransactions: tool({
        description: "List the user's recent payments (recipient, amount, date) for a period.",
        inputSchema: z.object({ period: z.enum(["week", "month", "quarter", "year"]).default("month") }),
        execute: async ({ period }) => {
          if (!wallet) return { error: "not signed in" };
          const recs = await records(period);
          return {
            period,
            transactions: recs.slice(0, 15).map((r) => ({
              recipient: r.recipient,
              amountUsd: r.amountUsd,
              date: new Date(r.createdAtMs).toISOString().slice(0, 10),
            })),
            topRecipients: byRecipient(recs).slice(0, 3),
          };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
