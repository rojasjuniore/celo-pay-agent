import { PaymentIntentSchema } from "@/modules/agent/payment-intent";
import { assertWithinPolicy } from "@/modules/agent/policy";
import { executePayment } from "@/modules/payments/executor";
import { ViemWalletAdapter } from "@/adapters/wallet.viem";
import { TreasuryRevenueAdapter } from "@/adapters/revenue.treasury";
import { NoahRampAdapter } from "@/adapters/ramp.noah";
import { getDb, schema } from "@/lib/db";

/**
 * Ejecuta un pago confirmado: encadena las transacciones REALES en Celo
 * (fee → transfer a Noah → off-ramp) y registra cada una en tx_log. Cablea los
 * adapters reales; falla fuerte sin credenciales (AGENT_PRIVATE_KEY, etc.).
 * No simula transacciones.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const parsed = PaymentIntentSchema.safeParse(body.intent);
  if (!parsed.success) {
    return Response.json({ error: "invalid intent", details: parsed.error.issues }, { status: 400 });
  }
  const intent = parsed.data;
  assertWithinPolicy(intent.amountUsd);

  const wallet = new ViemWalletAdapter();
  const deps = {
    wallet,
    revenue: new TreasuryRevenueAdapter(wallet),
    ramp: new NoahRampAdapter(),
    logTx: async (entry: { kind: string; chain: string; txHash: string; status: string }) => {
      const db = getDb();
      await db.insert(schema.txLog).values(entry);
    },
  };

  const receipt = await executePayment(intent, deps);
  return Response.json(receipt, { status: receipt.completed ? 200 : 502 });
}
