import type { PaymentConfirmation } from "./types";

const SCHEDULE_LABEL: Record<string, string> = {
  once: "una vez",
  weekly: "cada semana",
  biweekly: "cada quincena",
  monthly: "cada mes",
};

/**
 * Tarjeta de confirmación antes de mover dinero. Muestra el fee de forma
 * transparente. Datos reales por props (derivados del PaymentIntent + fee).
 */
export function ConfirmationCard({
  data,
  onConfirm,
  onEdit,
}: {
  data: PaymentConfirmation;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="rounded-[12px] border p-6 max-w-md"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--color-secondary)" }}>
        Confirmar pago
      </h3>
      <dl className="space-y-2 text-sm">
        <Row label="Envías" value={`$${data.amountUsd.toFixed(2)} USDT`} />
        <Row label="Fee de servicio" value={`$${data.feeUsd.toFixed(2)} (${(data.feeBps / 100).toFixed(2)}%)`} muted />
        <Row label="Destinatario" value={data.recipient} />
        {data.estimatedCop !== undefined && (
          <Row label="Recibe (aprox.)" value={`$${data.estimatedCop.toLocaleString("es-CO")} COP`} />
        )}
        <Row label="Frecuencia" value={SCHEDULE_LABEL[data.schedule] ?? data.schedule} />
        <Row label="Red" value="100% en Celo" />
        <Row label="Gas" value="$0 (pagado en USDT)" />
      </dl>
      <div className="flex gap-2 mt-5">
        <button
          onClick={onConfirm}
          className="h-10 px-5 rounded-[8px] text-sm font-medium"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          Confirmar y enviar
        </button>
        <button
          onClick={onEdit}
          className="h-10 px-5 rounded-[8px] text-sm font-medium border"
          style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
        >
          Editar
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt style={{ color: "var(--color-neutral)" }}>{label}</dt>
      <dd style={{ color: muted ? "var(--color-secondary)" : "var(--color-primary)" }}>{value}</dd>
    </div>
  );
}
