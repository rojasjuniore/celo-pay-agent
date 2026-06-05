/**
 * Autenticación de LECTURA: prueba que el caller controla una wallet, para
 * consultar SUS datos financieros (sin IDOR). A diferencia de la ejecución de
 * pagos, es idempotente (read-only) → no necesita nonce de un solo uso, pero sí
 * firma + frescura (anti-replay de la ventana). Lógica pura, testeable.
 */
export const READ_TTL_MS = 5 * 60 * 1000;

export interface SignedRead {
  wallet: `0x${string}`;
  issuedAtMs: number;
  signature: `0x${string}`;
}

/** Mensaje canónico que el usuario firma para autorizar la lectura de sus datos. */
export function buildReadMessage(wallet: `0x${string}`, issuedAtMs: number): string {
  return [
    "Remi — view my financial data",
    `wallet: ${wallet.toLowerCase()}`,
    `issuedAt: ${issuedAtMs}`,
  ].join("\n");
}

/** True si la firma está dentro de la ventana de validez. */
export function isReadFresh(issuedAtMs: number, nowMs: number): boolean {
  return nowMs - issuedAtMs >= 0 && nowMs - issuedAtMs <= READ_TTL_MS;
}
