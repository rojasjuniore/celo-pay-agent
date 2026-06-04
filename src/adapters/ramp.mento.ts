import { requireEnv } from "@/lib/env";
import { getMentoBroker, USDT, CCOP } from "@/lib/celo-constants";
import type { RampPort, SwapResult, OffRampResult } from "@/ports/ramp.port";

/**
 * Adapter de RampPort con Mento (cCOP) en Celo. El swap USDT→cCOP usa el Mento
 * Broker; el off-ramp cCOP→COP usa un proveedor (Noah/Mural) vía su API.
 *
 * Honestidad: el Broker NO está verificado en esta sesión (getMentoBroker falla
 * fuerte si MENTO_BROKER_ADDRESS no se define). El proveedor de off-ramp tampoco
 * está cableado a una API real todavía — su credencial se exige fail-loud.
 * Cero datos simulados: si falta algo, lanza.
 */
export class MentoRampAdapter implements RampPort {
  // El cliente de wallet/broker se inyectará cuando el Broker esté confirmado.
  readonly fromToken = USDT;
  readonly toToken = CCOP;

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

  async offRamp(amountCcop: bigint, account: string): Promise<OffRampResult> {
    if (amountCcop <= 0n || !account) {
      throw new Error("Invalid off-ramp params. / Parámetros de off-ramp inválidos.");
    }
    // Exige la credencial del proveedor; sin ella no inventa un payout.
    requireEnv("OFFRAMP_API_KEY");
    throw new Error(
      "Off-ramp provider (Noah/Mural) not wired yet. / Proveedor de off-ramp aún no integrado.",
    );
  }
}
