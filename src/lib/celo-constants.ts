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

/** USDT (Tether) en Celo. VERIFICADO (docs.celo.org/token-addresses). */
export const USDT: `0x${string}` =
  "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";

/** feeCurrency adapter para USDC. VERIFICADO. */
export const FEE_CURRENCY_USDC: `0x${string}` =
  "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B";

/** feeCurrency adapter para USDT. VERIFICADO vía governance Celo CGP-0167. */
export const FEE_CURRENCY_USDT: `0x${string}` =
  "0x0E2A3e05bc9A16F5292A6170456A710cb89C6f72";

/** FeeCurrencyDirectory: whitelist on-chain de fee currencies. VERIFICADO. */
export const FEE_CURRENCY_DIRECTORY: `0x${string}` =
  "0x15F344b9E6c3Cb6F0376A36A64928b13F62C6276";
