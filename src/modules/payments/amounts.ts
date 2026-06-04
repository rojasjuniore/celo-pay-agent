/**
 * Conversión de montos para USDT en Celo (6 decimales). Lógica pura, testeable.
 * Trabaja en bigint (unidad mínima) para no perder precisión con dinero.
 */

export const USDT_DECIMALS = 6;
const SCALE = 10n ** BigInt(USDT_DECIMALS);

/** USD (number) → unidad mínima de USDT (bigint). Trunca a 6 decimales. */
export function usdToUnits(usd: number): bigint {
  if (!Number.isFinite(usd) || usd <= 0) {
    throw new Error("Amount must be a positive number. / El monto debe ser positivo.");
  }
  // Redondea a 6 decimales antes de escalar para evitar errores de float.
  return BigInt(Math.round(usd * Number(SCALE)));
}

/** Unidad mínima (bigint) → USD (number), para mostrar. */
export function unitsToUsd(units: bigint): number {
  return Number(units) / Number(SCALE);
}
