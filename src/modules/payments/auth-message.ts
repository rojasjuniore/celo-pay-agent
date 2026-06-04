import type { PaymentIntent } from "@/modules/agent/payment-intent";

/**
 * Construcción y validación del mensaje que el usuario firma para autorizar un
 * pago. La firma prueba que controla la wallet; el mensaje liga la firma a ESTE
 * intent y a un instante (anti-replay). Lógica pura, testeable.
 */

/** Ventana de validez de la firma (anti-replay): 5 minutos. */
export const SIGNATURE_TTL_MS = 5 * 60 * 1000;

export interface SignedExecution {
  intent: PaymentIntent;
  /** Epoch ms en que se firmó. */
  issuedAtMs: number;
  /** Nonce de un solo uso (UUID) — anti-replay. */
  nonce: string;
  /** Firma del mensaje por la wallet del usuario. */
  signature: `0x${string}`;
  /** Wallet que firma (debe coincidir con el recover). */
  wallet: `0x${string}`;
}

/**
 * Mensaje canónico que se firma. Determinista a partir del intent + instante +
 * nonce. El nonce liga la firma a un único uso (se consume server-side).
 */
export function buildAuthMessage(
  intent: PaymentIntent,
  issuedAtMs: number,
  nonce: string,
): string {
  return [
    "Remi — authorize payment",
    `type: ${intent.type}`,
    `amount: $${intent.amountUsd} USD`,
    `to: ${intent.recipient}`,
    `country: ${intent.country}`,
    `schedule: ${intent.schedule}`,
    `issuedAt: ${issuedAtMs}`,
    `nonce: ${nonce}`,
  ].join("\n");
}

/** True si la firma está dentro de la ventana de validez respecto a `nowMs`. */
export function isFresh(issuedAtMs: number, nowMs: number): boolean {
  return nowMs - issuedAtMs >= 0 && nowMs - issuedAtMs <= SIGNATURE_TTL_MS;
}
