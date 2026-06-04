import { desc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Actividad onchain real: últimas tx del log + métricas agregadas (conteo).
 * Datos reales de la DB. Falla fuerte sin DATABASE_URL.
 */
export async function GET(): Promise<Response> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.txLog)
    .orderBy(desc(schema.txLog.createdAt))
    .limit(20);

  return Response.json({
    txCount: rows.length,
    items: rows.map((r) => ({
      kind: r.kind,
      chain: r.chain,
      txHash: r.txHash,
      status: r.status,
      createdAt: r.createdAt,
    })),
  });
}
