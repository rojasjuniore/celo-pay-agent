import { requireEnv } from "@/lib/env";
import { NoahOffRampAdapter } from "@/adapters/offramp.noah";
import type { RampPort, OffRampResult, OffRampInput } from "@/ports/ramp.port";

/**
 * Adapter de RampPort con Noah. El agente envía USDT directo en Celo a la
 * deposit address de Noah (NOAH_DEPOSIT_ADDRESS); Noah liquida a la moneda local
 * del país destino. Sin swap ni bridge. Falla fuerte sin credenciales/dirección.
 */
export class NoahRampAdapter implements RampPort {
  private readonly noah = new NoahOffRampAdapter();

  depositAddress(): `0x${string}` {
    const addr = requireEnv("NOAH_DEPOSIT_ADDRESS");
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      throw new Error(
        "NOAH_DEPOSIT_ADDRESS inválida. / Invalid Noah deposit address.",
      );
    }
    return addr as `0x${string}`;
  }

  async offRamp(input: OffRampInput): Promise<OffRampResult> {
    if (input.fiatAmount <= 0 || !input.country) {
      throw new Error("Invalid off-ramp params. / Parámetros de off-ramp inválidos.");
    }
    const result = await this.noah.payout({
      fiatAmount: input.fiatAmount,
      country: input.country,
      cryptoCurrency: "USDT",
      externalId: input.externalId,
    });
    return {
      reference: result.transactionId,
      status:
        result.status === "Settled"
          ? "settled"
          : result.status === "Failed"
            ? "failed"
            : "initiated",
      fiatCurrency: result.fiatCurrency,
    };
  }
}
