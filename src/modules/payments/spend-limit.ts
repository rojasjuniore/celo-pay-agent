import { POLICY } from "@/modules/agent/policy";

/**
 * Límite de gasto por usuario (server-side, no solo el cap por tx). Lógica pura:
 * recibe el gasto acumulado de la ventana y el monto nuevo, y decide. El conteo
 * real (suma de tx del usuario en la semana) lo provee la capa de DB.
 */
export class SpendLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpendLimitError";
  }
}

/** Falla fuerte si el nuevo monto excede el cap por tx o el semanal acumulado. */
export function assertSpendAllowed(amountUsd: number, weekSpentUsd: number): void {
  if (amountUsd > POLICY.maxPerTxUsd) {
    throw new SpendLimitError(
      `Amount $${amountUsd} exceeds per-tx limit $${POLICY.maxPerTxUsd}. / Excede el límite por transacción.`,
    );
  }
  if (weekSpentUsd + amountUsd > POLICY.maxPerWeekUsd) {
    throw new SpendLimitError(
      `Weekly limit $${POLICY.maxPerWeekUsd} exceeded (spent $${weekSpentUsd}). / Excede el límite semanal.`,
    );
  }
}
