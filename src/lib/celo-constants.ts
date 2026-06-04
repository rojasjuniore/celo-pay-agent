import { type EnvSource } from "@/lib/env";

/**
 * Direcciones onchain verificadas en Celo Mainnet. Centralizadas aquí para que
 * ningún adapter hardcodee direcciones sueltas. Todas son `0x${string}` (formato
 * viem) sin depender de viem en tiempo de tipos.
 */

export const CELO_CHAIN_ID = 42220 as const;

/** ERC-8004 Identity Registry. VERIFICADO. */
export const IDENTITY_REGISTRY: `0x${string}` =
  "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";

/** ERC-8004 Reputation Registry. VERIFICADO. */
export const REPUTATION_REGISTRY: `0x${string}` =
  "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";

/** USDm — Mento Dollar. VERIFICADO. */
export const USDM: `0x${string}` =
  "0x765DE816845861e75A25fCA122bb6898B8B1282a";

/** feeCurrency adapter para USDC. VERIFICADO. */
export const FEE_CURRENCY_USDC: `0x${string}` =
  "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";

// UNCONFIRMED: feeCurrency adapter para USDT. No usar sin confirmar onchain.
// Protegido por assertFeeCurrencyConfirmed() abajo.
export const FEE_CURRENCY_USDT: `0x${string}` =
  "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72";

/**
 * Falla fuerte si se intenta usar el adapter USDT sin confirmarlo explícitamente
 * vía la env var FEECURRENCY_USDT_CONFIRMED=true. Evita pagar fees con una
 * dirección no verificada.
 */
export function assertFeeCurrencyConfirmed(
  source: EnvSource = process.env,
): void {
  // No está en el EnvSchema (es un flag de override puntual); se lee directo.
  if (source.FEECURRENCY_USDT_CONFIRMED !== "true") {
    throw new Error(
      "USDT feeCurrency adapter is UNCONFIRMED; set FEECURRENCY_USDT_CONFIRMED=true after verifying onchain. / " +
        "El adapter feeCurrency de USDT está SIN CONFIRMAR; verifícalo onchain y define FEECURRENCY_USDT_CONFIRMED=true.",
    );
  }
}
