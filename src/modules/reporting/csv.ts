import type { PaymentRecord } from "./summary";

/**
 * Serializa registros de pago a CSV (puro, sin librería). Escapa comillas y
 * comas. Para reportes exportables (tax-ready).
 */
const HEADER = ["date", "amount_usd", "recipient", "country", "category"];

function escape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function toCsv(records: PaymentRecord[]): string {
  const rows = records.map((r) =>
    [
      new Date(r.createdAtMs).toISOString().slice(0, 10),
      r.amountUsd.toFixed(2),
      r.recipient,
      r.country,
      r.category,
    ]
      .map((c) => escape(String(c)))
      .join(","),
  );
  return [HEADER.join(","), ...rows].join("\n");
}
