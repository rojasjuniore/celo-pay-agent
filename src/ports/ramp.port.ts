/**
 * RampPort — off-ramp GLOBAL a moneda local vía Noah. El agente envía USDT
 * directo en Celo a la deposit address de Noah; Noah liquida a la moneda local
 * del país destino (120+ monedas, corredor por país). No hay swap ni bridge:
 * todo el onchain es un transfer de USDT en Celo.
 */
export interface OffRampResult {
  /** Referencia del payout en Noah. */
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
  /** Deposit address de Noah en Celo: donde el agente envía el USDT. */
  depositAddress(): `0x${string}`;
  /** Off-ramp a moneda local (global, vía Noah). */
  offRamp(input: OffRampInput): Promise<OffRampResult>;
}
