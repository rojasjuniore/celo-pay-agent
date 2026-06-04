import { requireEnv } from "@/lib/env";
import { computeFee, getFeeBps, type FeeSplit } from "@/modules/revenue/fee";
import { feeCurrencyFor } from "@/modules/wallet/fee-currency";
import type { RevenuePort } from "@/ports/revenue.port";
import type { WalletPort } from "@/ports/wallet.port";

/**
 * Adapter de RevenuePort: cobra el fee de servicio a la wallet de tesorería
 * (TREASURY_ADDRESS) usando el WalletPort del agente. Gasless (gas en el mismo
 * token). Falla fuerte si falta la tesorería.
 */
export class TreasuryRevenueAdapter implements RevenuePort {
  constructor(private readonly wallet: WalletPort) {}

  split(amount: bigint): FeeSplit {
    return computeFee(amount, getFeeBps());
  }

  async collect(token: `0x${string}`, fee: bigint): Promise<`0x${string}`> {
    if (fee <= 0n) {
      throw new Error("Fee must be positive to collect. / El fee a cobrar debe ser positivo.");
    }
    const treasury = requireEnv("TREASURY_ADDRESS") as `0x${string}`;
    // El fee se paga gasless en el mismo stablecoin del pago cuando aplica.
    return this.wallet.transferStablecoin({
      token,
      to: treasury,
      amount: fee,
      feeCurrency: feeCurrencyFor("USDC"),
    });
  }
}
