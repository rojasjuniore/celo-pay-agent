import { eq, gte, and } from "drizzle-orm";
import { verifySignature } from "thirdweb/auth";
import { PaymentIntentSchema } from "@/modules/agent/payment-intent";
import { executePayment } from "@/modules/payments/executor";
import { buildAuthMessage, isFresh, type SignedExecution } from "@/modules/payments/auth-message";
import { assertSpendAllowed, SpendLimitError } from "@/modules/payments/spend-limit";
import { ViemWalletAdapter } from "@/adapters/wallet.viem";
import { TreasuryRevenueAdapter } from "@/adapters/revenue.treasury";
import { NoahRampAdapter } from "@/adapters/ramp.noah";
import { getThirdwebServerClient } from "@/lib/thirdweb-server";
import { getDb, schema } from "@/lib/db";

/**
 * Ejecuta un pago confirmado con AUTORIZACIÓN server-side (no confía en el
 * cliente):
 *  1. Verifica la FIRMA del usuario sobre el mensaje del intent (prueba control
 *     de la wallet) + frescura (anti-replay).
 *  2. Re-verifica el KYC en la DB (no el gate del frontend).
 *  3. Aplica el límite de gasto por usuario (por-tx + semanal) server-side.
 * Solo entonces ejecuta las tx reales en Celo. Falla fuerte sin credenciales.
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as Partial<SignedExecution>;
  const parsed = PaymentIntentSchema.safeParse(body.intent);
  if (!parsed.success || !body.signature || !body.wallet || !body.issuedAtMs || !body.nonce) {
    return Response.json({ error: "invalid request" }, { status: 400 });
  }
  const intent = parsed.data;
  const wallet = body.wallet.toLowerCase() as `0x${string}`;
  const nonce = body.nonce;

  // 1. Firma fresca + válida → prueba que el caller controla `wallet`.
  if (!isFresh(body.issuedAtMs, Date.parse(new Date().toISOString()))) {
    return Response.json({ error: "signature expired" }, { status: 401 });
  }
  const message = buildAuthMessage(intent, body.issuedAtMs, nonce);
  const validSig = await verifySignature({
    client: getThirdwebServerClient(),
    address: wallet,
    message,
    signature: body.signature,
  });
  if (!validSig) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const db = getDb();

  // 1b. Consume el nonce (un solo uso). Si ya existía, es un replay → rechaza.
  const inserted = await db
    .insert(schema.usedNonces)
    .values({ nonce, wallet })
    .onConflictDoNothing()
    .returning({ nonce: schema.usedNonces.nonce });
  if (inserted.length === 0) {
    return Response.json({ error: "nonce already used (replay)" }, { status: 401 });
  }

  // 2. KYC server-side (la verdad está en la DB, no en el cliente).
  const acct = (
    await db.select().from(schema.accounts).where(eq(schema.accounts.wallet, wallet)).limit(1)
  )[0];
  if (!acct?.kycVerified) {
    return Response.json({ error: "kyc required" }, { status: 403 });
  }

  // 3. Límite de gasto: suma el gasto de la última semana de esta wallet.
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await db
    .select({ amount: schema.paymentIntents.amountUsd })
    .from(schema.paymentIntents)
    .where(
      and(
        eq(schema.paymentIntents.ownerWallet, wallet),
        gte(schema.paymentIntents.createdAt, weekAgo),
      ),
    );
  const weekSpent = recent.reduce((s, r) => s + Number(r.amount), 0);
  try {
    assertSpendAllowed(intent.amountUsd, weekSpent);
  } catch (e) {
    if (e instanceof SpendLimitError) return Response.json({ error: e.message }, { status: 403 });
    throw e;
  }

  // Registra el intent (con ownerWallet) ANTES de ejecutar: así cuenta para el
  // límite semanal de futuras solicitudes y queda trazabilidad del pago.
  await db.insert(schema.paymentIntents).values({
    ownerWallet: wallet,
    type: intent.type,
    amountUsd: String(intent.amountUsd),
    recipient: intent.recipient,
    country: intent.country,
    schedule: intent.schedule,
    status: "executing",
  });

  // Autorizado → ejecuta de verdad.
  const agentWallet = new ViemWalletAdapter();
  const receipt = await executePayment(intent, {
    wallet: agentWallet,
    revenue: new TreasuryRevenueAdapter(agentWallet),
    ramp: new NoahRampAdapter(),
    logTx: async (entry) => {
      await db.insert(schema.txLog).values(entry);
    },
  });
  return Response.json(receipt, { status: receipt.completed ? 200 : 502 });
}
