import type { PaymentIntent } from "@/modules/agent/payment-intent";

/**
 * Selección pura de intents vencidos. Recibe el instante actual como parámetro
 * (no lo genera) para ser determinista y testeable sin red ni reloj.
 */

export interface ScheduledIntent extends PaymentIntent {
  id: string;
  status: "pending" | "executing" | "done" | "failed";
  /** Epoch ms en que debe ejecutarse la próxima vez. */
  nextRunAtMs: number;
}

/** Devuelve los intents pendientes cuya hora de ejecución ya pasó. */
export function selectDueIntents(
  intents: readonly ScheduledIntent[],
  nowMs: number,
): ScheduledIntent[] {
  return intents.filter(
    (i) => i.status === "pending" && i.nextRunAtMs <= nowMs,
  );
}

const PERIOD_MS: Record<PaymentIntent["schedule"], number | null> = {
  once: null,
  weekly: 7 * 24 * 60 * 60 * 1000,
  biweekly: 14 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Calcula el próximo nextRunAtMs tras ejecutar, según la frecuencia.
 * Devuelve null para pagos únicos (no se reprograman).
 */
export function nextRunAfter(
  intent: Pick<PaymentIntent, "schedule">,
  lastRunMs: number,
): number | null {
  const period = PERIOD_MS[intent.schedule];
  return period === null ? null : lastRunMs + period;
}
