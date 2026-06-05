import { eq, gte, lte, and, desc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { normalizeCategory } from "@/modules/reporting/category";
import type { PaymentRecord } from "@/modules/reporting/summary";

/**
 * Lee los pagos de UN usuario (scoping estricto por ownerWallet) en un rango de
 * fechas, como PaymentRecord para el módulo de reporting. Datos reales de la DB.
 */
export async function getPaymentRecords(
  wallet: `0x${string}`,
  fromMs: number,
  toMs: number,
): Promise<PaymentRecord[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.paymentIntents)
    .where(
      and(
        eq(schema.paymentIntents.ownerWallet, wallet.toLowerCase()),
        gte(schema.paymentIntents.createdAt, new Date(fromMs)),
        lte(schema.paymentIntents.createdAt, new Date(toMs)),
      ),
    )
    .orderBy(desc(schema.paymentIntents.createdAt));

  return rows.map((r) => ({
    amountUsd: Number(r.amountUsd),
    recipient: r.recipient,
    country: r.country,
    category: normalizeCategory(r.category),
    createdAtMs: r.createdAt.getTime(),
  }));
}
