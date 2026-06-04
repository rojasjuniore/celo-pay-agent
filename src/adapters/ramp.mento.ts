import { getMentoBroker, USDT, CCOP } from "@/lib/celo-constants";
import { NoahOffRampAdapter } from "@/adapters/offramp.noah";
import type { RampPort, SwapResult, OffRampResult, OffRampInput } from "@/ports/ramp.port";

/**
 * Adapter de RampPort: swap USDT→cCOP en Celo (Mento) + off-ramp GLOBAL (Noah).
 *
 * Honestidad: el swap usa el Mento Broker, cuya dirección NO está verificada
 * (getMentoBroker falla fuerte sin MENTO_BROKER_ADDRESS). El off-ramp delega en
 * NoahOffRampAdapter, que sí llama a la API real de Noah (producción). Cero
 * datos simulados: si falta una credencial o el Broker, lanza.
 */
export class MentoRampAdapter implements RampPort {
  readonly fromToken = USDT;
  readonly toToken = CCOP;
  private readonly noah = new NoahOffRampAdapter();

  async swapToLocal(amountUsdt: bigint): Promise<SwapResult> {
    if (amountUsdt <= 0n) {
      throw new Error("Swap amount must be positive. / El monto a convertir debe ser positivo.");
    }
    // Falla fuerte mientras el Broker no esté verificado y configurado.
    getMentoBroker();
    throw new Error(
      "Mento swap not wired yet: verify MENTO_BROKER_ADDRESS and implement broker.swapIn. / " +
        "Swap de Mento aún no cableado: verifica el Broker e implementa swapIn.",
    );
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
      status: result.status === "Settled" ? "settled" : result.status === "Failed" ? "failed" : "initiated",
      fiatCurrency: result.fiatCurrency,
    };
  }
}
