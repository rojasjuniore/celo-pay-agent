/**
 * Cálculo del fee de servicio del agente. Lógica pura (sin red). El porcentaje
 * es configurable vía REVENUE_FEE_BPS (basis points), default 50 = 0.5%. No se
 * hardcodea el valor de negocio: vive en env, con un default razonable.
 */

import type { EnvSource } from "@/lib/env";

/** Default: 50 bps = 0.5%. */
export const DEFAULT_FEE_BPS = 50;
const BPS_DENOMINATOR = 10_000n;

/** Lee los basis points del fee del entorno; valida rango [0, 1000] (≤10%). */
export function getFeeBps(source: EnvSource = process.env): number {
  const raw = source.REVENUE_FEE_BPS;
  if (raw === undefined || raw === "") return DEFAULT_FEE_BPS;
  const bps = Number.parseInt(raw, 10);
  if (!Number.isInteger(bps) || bps < 0 || bps > 1000) {
    throw new Error(
      `Invalid REVENUE_FEE_BPS '${raw}' (expected integer 0-1000). / REVENUE_FEE_BPS inválido.`,
    );
  }
  return bps;
}

export interface FeeSplit {
  /** Monto del fee de servicio (unidad mínima del token). */
  fee: bigint;
  /** Monto neto que se envía al destinatario tras el fee. */
  net: bigint;
  /** Basis points aplicados. */
  bps: number;
}

/**
 * Divide un monto en (fee, neto) según los bps. Trabaja en bigint (unidad
 * mínima del token) para no perder precisión. El fee se trunca hacia abajo.
 */
export function computeFee(amount: bigint, bps: number): FeeSplit {
  if (amount <= 0n) {
    throw new Error("Amount must be positive. / El monto debe ser positivo.");
  }
  const fee = (amount * BigInt(bps)) / BPS_DENOMINATOR;
  return { fee, net: amount - fee, bps };
}
