/**
 * RampPort — conversión a moneda local (COP) dentro de Celo. Dos pasos:
 * swap USDT → cCOP (Mento) onchain, y off-ramp cCOP → COP a cuenta bancaria.
 * Todo ocurre en Celo (sin bridge a otras redes).
 */
export interface SwapResult {
  txHash: `0x${string}`;
  /** cCOP recibido (unidad mínima). */
  amountOut: bigint;
}

export interface OffRampResult {
  /** Referencia del payout (proveedor de off-ramp). */
  reference: string;
  status: "initiated" | "settled";
}

export interface RampPort {
  /** Swap USDT → cCOP en Celo vía Mento. */
  swapToLocal(amountUsdt: bigint): Promise<SwapResult>;
  /** Off-ramp cCOP → COP a una cuenta destino. */
  offRamp(amountCcop: bigint, account: string): Promise<OffRampResult>;
}
