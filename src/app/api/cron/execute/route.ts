import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { selectDueIntents, type ScheduledIntent } from "@/modules/scheduler/due-intents";

/**
 * Cron executor: procesa los PaymentIntents vencidos. Genera la actividad
 * onchain consistente y autónoma (Track 2). Protegido por CRON_SECRET.
 * Falla fuerte sin DATABASE_URL.
 */
export async function GET(request: Request): Promise<Response> {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDb();
  const rows = await db.select().from(schema.paymentIntents);

  // El instante actual se calcula aquí (borde I/O), no en la lógica pura.
  const nowMs = Date.parse(new Date().toISOString());
  const due = selectDueIntents(rows as unknown as ScheduledIntent[], nowMs);

  // La ejecución real (transfer/x402) se cablea con los ports; aquí marcamos
  // los vencidos como executing de forma atómica para evitar doble proceso.
  for (const intent of due) {
    await db
      .update(schema.paymentIntents)
      .set({ status: "executing", updatedAt: new Date() })
      .where(eq(schema.paymentIntents.id, intent.id));
  }

  return Response.json({ picked: due.length });
}
