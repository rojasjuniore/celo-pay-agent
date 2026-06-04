import type { PaymentIntent } from "./payment-intent";
import { computeFee, getFeeBps } from "@/modules/revenue/fee";

/**
 * Plan de ejecución de un pago: la secuencia de pasos onchain que el agente
 * realizará, derivada del intent. Puro (sin red): describe QUÉ se hará, para
 * mostrarlo en la UI y para que el ejecutor lo recorra. Sin datos inventados.
 */

export interface PlannedStep {
  key: "fee" | "quote" | "swap" | "offramp";
  label: string;
}

export interface ExecutionPlan {
  feeUsd: number;
  netUsd: number;
  feeBps: number;
  steps: PlannedStep[];
}

const STEP_LABELS: Record<PlannedStep["key"], string> = {
  fee: "Cobro de fee de servicio (USDT)",
  quote: "Quote de FX (x402)",
  swap: "Swap USDT → cCOP (Mento, en Celo)",
  offramp: "Off-ramp cCOP → COP",
};

/** Construye el plan a partir del intent y los bps del fee del entorno. */
export function buildExecutionPlan(
  intent: PaymentIntent,
  feeBps: number = getFeeBps(),
): ExecutionPlan {
  // Trabaja en unidad mínima de 6 decimales (USDT) para el cálculo del fee.
  const micro = BigInt(Math.round(intent.amountUsd * 1_000_000));
  const { fee, net } = computeFee(micro, feeBps);

  const keys: PlannedStep["key"][] =
    intent.country === "CO"
      ? ["fee", "quote", "swap", "offramp"]
      : ["fee", "quote"];

  return {
    feeUsd: Number(fee) / 1_000_000,
    netUsd: Number(net) / 1_000_000,
    feeBps,
    steps: keys.map((key) => ({ key, label: STEP_LABELS[key] })),
  };
}
