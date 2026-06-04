import type { PaymentIntent } from "@/modules/agent/payment-intent";
import { buildExecutionPlan } from "@/modules/agent/execution-plan";
import { usdToUnits } from "./amounts";
import { USDT } from "@/lib/celo-constants";
import { currencyForCountry } from "@/modules/ramp/local-currency";
import type { WalletPort } from "@/ports/wallet.port";
import type { RevenuePort } from "@/ports/revenue.port";
import type { RampPort } from "@/ports/ramp.port";

/**
 * Ejecutor onchain: recorre el ExecutionPlan de un PaymentIntent ejecutando las
 * transacciones reales en Celo, en orden, y devuelve el registro de cada paso.
 *
 * Inyección de puertos (testeable). Fail-fast: si un paso lanza, detiene la
 * cadena y devuelve lo hecho hasta ahí con el error — no continúa moviendo
 * dinero a ciegas. Sin simulación: los adapters reales fallan fuerte sin llaves.
 */

export interface StepReceipt {
  key: "fee" | "transfer" | "offramp";
  txHash?: `0x${string}`;
  reference?: string;
  ok: boolean;
  error?: string;
}

export interface ExecutionReceipt {
  steps: StepReceipt[];
  /** Hash de la transferencia principal a Noah, si se completó. */
  transferHash?: `0x${string}`;
  /** Referencia del payout de Noah, si se inició. */
  offRampRef?: string;
  completed: boolean;
}

export interface ExecutorDeps {
  wallet: WalletPort;
  revenue: RevenuePort;
  ramp: RampPort;
  /** Registra una tx en el log (DB real). */
  logTx: (entry: {
    kind: string;
    chain: string;
    txHash: string;
    status: string;
  }) => Promise<void>;
}

/** Ejecuta el pago descrito por el intent. */
export async function executePayment(
  intent: PaymentIntent,
  deps: ExecutorDeps,
): Promise<ExecutionReceipt> {
  const plan = buildExecutionPlan(intent);
  const total = usdToUnits(intent.amountUsd);
  const { fee, net } = deps.revenue.split(total);
  const steps: StepReceipt[] = [];
  const receipt: ExecutionReceipt = { steps, completed: false };

  try {
    // 1. Cobra el fee de servicio a la tesorería (tx en Celo).
    if (fee > 0n) {
      const feeHash = await deps.revenue.collect(USDT, fee);
      await deps.logTx({ kind: "fee", chain: "celo", txHash: feeHash, status: "confirmed" });
      steps.push({ key: "fee", txHash: feeHash, ok: true });
    }

    // 2. Transfiere el neto a la deposit address de Noah en Celo (gasless).
    const transferHash = await deps.wallet.transferStablecoin({
      token: USDT,
      to: deps.ramp.depositAddress(),
      amount: net,
    });
    await deps.logTx({ kind: "transfer", chain: "celo", txHash: transferHash, status: "confirmed" });
    steps.push({ key: "transfer", txHash: transferHash, ok: true });
    receipt.transferHash = transferHash;

    // 3. Noah liquida a moneda local (off-ramp). Solo si hay corredor.
    if (plan.steps.some((s) => s.key === "offramp")) {
      const out = await deps.ramp.offRamp({
        fiatAmount: Number(net) / 1_000_000, // monto neto en USD ~ base del payout
        country: intent.country,
        externalId: transferHash,
      });
      await deps.logTx({ kind: "ramp", chain: out.fiatCurrency, txHash: out.reference, status: out.status });
      steps.push({ key: "offramp", reference: out.reference, ok: out.status !== "failed" });
      receipt.offRampRef = out.reference;
    }

    receipt.completed = true;
    return receipt;
  } catch (err) {
    // Fail-fast: detiene la cadena, reporta el paso que falló. No sigue.
    const message = err instanceof Error ? err.message : String(err);
    const failedKey = steps.length === 0 ? "fee" : steps[steps.length - 1].key === "fee" ? "transfer" : "offramp";
    steps.push({ key: failedKey as StepReceipt["key"], ok: false, error: message });
    return receipt;
  }
}

/** Moneda local destino del intent (para mostrar en el recibo). */
export function intentCurrency(intent: PaymentIntent): string {
  return currencyForCountry(intent.country);
}
