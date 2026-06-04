import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/**
 * Estado de una cuenta por wallet: existe y si tiene KYC. Lo usa el guard de
 * navegación para decidir login → onboarding → dashboard. Datos reales de la DB.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wallet: string }> },
): Promise<Response> {
  const { wallet } = await params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(wallet)) {
    return Response.json({ error: "invalid wallet" }, { status: 400 });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.wallet, wallet.toLowerCase()))
    .limit(1);

  const account = rows[0];
  return Response.json({
    exists: !!account,
    kycVerified: !!account?.kycVerified,
  });
}
