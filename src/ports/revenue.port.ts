import type { FeeSplit } from "@/modules/revenue/fee";

/**
 * RevenuePort — capa de monetización del agente. Calcula y cobra el fee de
 * servicio (transparente, se muestra en el recibo) a la wallet de tesorería.
 * Cada cobro es una tx onchain real en Celo.
 */
export interface RevenuePort {
  /** Calcula el split (fee, neto) para un monto dado. */
  split(amount: bigint): FeeSplit;
  /** Cobra el fee transfiriéndolo a la tesorería; devuelve el hash de la tx. */
  collect(token: `0x${string}`, fee: bigint): Promise<`0x${string}`>;
}
