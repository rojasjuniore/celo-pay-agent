/**
 * RampPort — conversión a moneda local dentro de Celo + off-ramp GLOBAL.
 * Swap USDT → cCOP (Mento) onchain en Celo, y off-ramp a moneda local vía Noah
 * (el corredor lo resuelve el país, 120+ monedas). Todo el onchain ocurre en Celo.
 */
export interface SwapResult {
  txHash: `0x${string}`;
  /** cCOP recibido (unidad mínima). */
  amountOut: bigint;
}

export interface OffRampResult {
  /** Referencia del payout (proveedor de off-ramp). */
  reference: string;
  status: "initiated" | "settled" | "failed";
  /** Moneda local entregada (ISO-4217). */
  fiatCurrency: string;
}

export interface OffRampInput {
  /** Monto fiat en la moneda local destino. */
  fiatAmount: number;
  /** País destino ISO-3166 alpha-2 (define el corredor de Noah). */
  country: string;
  /** Referencia idempotente. */
  externalId: string;
}

export interface RampPort {
  /** Swap USDT → cCOP en Celo vía Mento. */
  swapToLocal(amountUsdt: bigint): Promise<SwapResult>;
  /** Off-ramp a moneda local (global, vía Noah). */
  offRamp(input: OffRampInput): Promise<OffRampResult>;
}
