import {
  FEE_CURRENCY_USDC,
  FEE_CURRENCY_USDT,
  USDM,
} from "@/lib/celo-constants";

/**
 * Mapea un token de pago a su feeCurrency adapter (para gas gasless en ese
 * mismo stablecoin). Lógica pura: no toca red. El adapter USDT está sin
 * confirmar y se protege aparte con assertFeeCurrencyConfirmed().
 */

/** Símbolos de stablecoin soportados como feeCurrency. */
export const FEE_TOKENS = ["USDC", "USDT", "USDm"] as const;
export type FeeToken = (typeof FEE_TOKENS)[number];

const FEE_CURRENCY_BY_TOKEN: Record<FeeToken, `0x${string}` | undefined> = {
  USDC: FEE_CURRENCY_USDC,
  USDT: FEE_CURRENCY_USDT,
  // USDm no tiene adapter de feeCurrency conocido: el gas se paga con otro token.
  USDm: undefined,
};

/** Devuelve el feeCurrency adapter para un token, o undefined si no aplica. */
export function feeCurrencyFor(token: FeeToken): `0x${string}` | undefined {
  return FEE_CURRENCY_BY_TOKEN[token];
}

/** True si el feeCurrency dado es el adapter USDT (no verificado). */
export function isUnconfirmedFeeCurrency(
  feeCurrency: `0x${string}` | undefined,
): boolean {
  if (!feeCurrency) return false;
  return feeCurrency.toLowerCase() === FEE_CURRENCY_USDT.toLowerCase();
}

export { USDM };
