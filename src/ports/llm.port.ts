import type { PaymentIntent } from "@/modules/agent/payment-intent";

/**
 * LLMPort — interpretación de lenguaje natural (ES/EN) a un PaymentIntent.
 * El adapter (llm.openrouter.ts) llama al modelo; el dominio solo ve esta
 * interfaz y el schema Zod compartido.
 */
export interface LLMPort {
  /** Interpreta un mensaje del usuario en un PaymentIntent validado. */
  interpret(message: string): Promise<PaymentIntent>;
}
