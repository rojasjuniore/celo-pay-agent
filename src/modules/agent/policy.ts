/**
 * Policy del agente: límites de gasto que acotan su "agencia".
 * Centralizado aquí para que tanto el parser como el ejecutor lo respeten.
 */
export const POLICY = {
  /** Máximo por transacción individual, en USD. */
  maxPerTxUsd: 200,
  /** Máximo acumulado por semana, en USD. */
  maxPerWeekUsd: 500,
} as const;

export class PolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PolicyError";
  }
}

/** Valida un monto contra el límite por transacción. Falla fuerte si lo excede. */
export function assertWithinPolicy(amountUsd: number): void {
  if (amountUsd > POLICY.maxPerTxUsd) {
    throw new PolicyError(
      `Monto $${amountUsd} excede el límite de policy de $${POLICY.maxPerTxUsd} por transacción.`,
    );
  }
}
