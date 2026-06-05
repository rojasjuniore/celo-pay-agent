import { computeFee } from "@/modules/revenue/fee";
import type { Category } from "./category";

/**
 * Agregaciones contables puras (sin red, testeables) sobre los pagos del
 * usuario. La capa de DB provee los registros ya filtrados por ownerWallet.
 */

/** Registro contable: un pago del usuario (de payment_intents). */
export interface PaymentRecord {
  amountUsd: number;
  recipient: string;
  country: string;
  category: Category;
  /** Epoch ms de creación. */
  createdAtMs: number;
}

export interface SpendingSummary {
  totalUsd: number;
  count: number;
  feesUsd: number;
  topRecipient: { recipient: string; totalUsd: number } | null;
}

/** Filtra registros dentro de [fromMs, toMs]. */
export function inPeriod(records: PaymentRecord[], fromMs: number, toMs: number): PaymentRecord[] {
  return records.filter((r) => r.createdAtMs >= fromMs && r.createdAtMs <= toMs);
}

/** Resumen de gasto: total, nº de pagos, fees estimados, top destinatario. */
export function spendingSummary(records: PaymentRecord[], feeBps: number): SpendingSummary {
  const totalUsd = round2(records.reduce((s, r) => s + r.amountUsd, 0));
  const feesUsd = round2(
    records.reduce((s, r) => {
      const { fee } = computeFee(BigInt(Math.round(r.amountUsd * 1_000_000)), feeBps);
      return s + Number(fee) / 1_000_000;
    }, 0),
  );
  const byRec = byRecipient(records);
  const topRecipient = byRec.length > 0 ? byRec[0] : null;
  return { totalUsd, count: records.length, feesUsd, topRecipient };
}

/** Gasto por categoría, ordenado de mayor a menor. */
export function byCategory(records: PaymentRecord[]): { category: Category; totalUsd: number }[] {
  const map = new Map<Category, number>();
  for (const r of records) map.set(r.category, (map.get(r.category) ?? 0) + r.amountUsd);
  return [...map.entries()]
    .map(([category, totalUsd]) => ({ category, totalUsd: round2(totalUsd) }))
    .sort((a, b) => b.totalUsd - a.totalUsd);
}

/** Gasto por destinatario, ordenado de mayor a menor. */
export function byRecipient(records: PaymentRecord[]): { recipient: string; totalUsd: number }[] {
  const map = new Map<string, number>();
  for (const r of records) map.set(r.recipient, (map.get(r.recipient) ?? 0) + r.amountUsd);
  return [...map.entries()]
    .map(([recipient, totalUsd]) => ({ recipient, totalUsd: round2(totalUsd) }))
    .sort((a, b) => b.totalUsd - a.totalUsd);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
