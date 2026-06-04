import {
  FEE_CURRENCY_USDC,
  FEE_CURRENCY_USDT,
  USDM,
} from "@/lib/celo-constants";

/**
 * Mapea un token de pago a su feeCurrency adapter (para gas gasless en ese
 * mismo stablecoin). Lógica pura: no toca red. Ambos adapters (USDC y USDT)
 * están verificados vía governance de Celo.
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

export { USDM };
