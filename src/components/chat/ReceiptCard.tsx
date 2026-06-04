import type { Receipt } from "./types";
import { celoscanTx, shortHash } from "./explorer";

/** Recibo final con enlaces a Celoscan. Datos reales por props. */
export function ReceiptCard({ receipt }: { receipt: Receipt }) {
  return (
    <div
      className="rounded-[12px] border p-6 max-w-md"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--color-success)" }}>
        Recibo ✅
      </h3>
      <dl className="space-y-2 text-sm">
        <Row label="Enviado" value={`$${receipt.sentUsd.toFixed(2)} USDT`} />
        <Row label="Fee de servicio" value={`$${receipt.feeUsd.toFixed(2)}`} />
        {receipt.receivedCop !== undefined && (
          <Row label="Recibido" value={`$${receipt.receivedCop.toLocaleString("es-CO")} COP`} />
        )}
      </dl>
      <div className="mt-4 space-y-1 font-mono text-xs">
        {receipt.txHashes.map((t, i) => (
          <a
            key={i}
            href={celoscanTx(t.hash)}
            target="_blank"
            rel="noreferrer"
            className="block"
            style={{ color: "var(--color-tertiary)" }}
          >
            {t.label}: {shortHash(t.hash)} ↗
          </a>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: "var(--color-neutral)" }}>{label}</dt>
      <dd style={{ color: "var(--color-primary)" }}>{value}</dd>
    </div>
  );
}
