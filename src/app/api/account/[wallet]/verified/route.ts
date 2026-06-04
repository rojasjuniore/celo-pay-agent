import { sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Marca una wallet como KYC-verificada (tras pasar Self). Upsert en accounts.
 * Datos reales en DB. En producción, la verificación de fondo la confirma el
 * webhook/endpoint de Self (/api/self/verify); este endpoint refleja el éxito
 * en la cuenta del usuario.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ wallet: string }> },
): Promise<Response> {
  const { wallet } = await params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    return Response.json({ error: "invalid wallet" }, { status: 400 });
  }

  const db = getDb();
  const w = wallet.toLowerCase();
  await db
    .insert(schema.accounts)
    .values({ wallet: w, kycVerified: new Date() })
    .onConflictDoUpdate({
      target: schema.accounts.wallet,
      set: { kycVerified: new Date(), updatedAt: sql`now()` },
    });

  return Response.json({ status: "verified" });
}
