import type { PaymentIntent } from "@/modules/agent/payment-intent";

/** Datos de identidad del agente (de ERC-8004 / Self), por props reales. */
export interface AgentIdentity {
  agentId?: string;
  selfVerified?: boolean;
  scanUrl?: string;
}

/** Métricas de actividad onchain reales (del log de tx). */
export interface AgentActivity {
  txCount: number;
  volumeUsd: number;
  gasPaidUsd: number;
}

/** Confirmación de un pago propuesto, derivada del PaymentIntent + fee. */
export interface PaymentConfirmation extends PaymentIntent {
  feeUsd: number;
  netUsd: number;
  /** Basis points del fee aplicados (para mostrar el %). */
  feeBps: number;
  estimatedCop?: number;
}

/** Un paso de la ejecución onchain en vivo. */
export interface ExecutionStep {
  label: string;
  status: "pending" | "running" | "done" | "failed";
  txHash?: `0x${string}`;
}

/** Recibo final con enlaces a exploradores. */
export interface Receipt {
  sentUsd: number;
  feeUsd: number;
  receivedCop?: number;
  txHashes: { label: string; hash: `0x${string}` }[];
}
