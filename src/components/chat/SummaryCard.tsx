"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

/** Paleta sobria (estilo Coinbase) para las gráficas. */
const COLORS = ["#0052ff", "#05b169", "#f4b000", "#7c828a", "#cf202f", "#a8b8cc"];

interface SummaryData {
  period: string;
  totalUsd: number;
  count: number;
  feesUsd: number;
  topRecipient: { recipient: string; totalUsd: number } | null;
}

/** Tarjeta de resumen de gastos con métricas + datos reales. */
export function SummaryCard({ data }: { data: SummaryData }) {
  return (
    <div className="rounded-2xl border p-5 w-full max-w-sm" style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--cb-muted)" }}>
        Spending · {data.period}
      </p>
      <p className="text-3xl font-mono font-medium" style={{ color: "var(--cb-ink)" }}>
        ${data.totalUsd.toFixed(2)}
      </p>
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <Metric label="Payments" value={String(data.count)} />
        <Metric label="Fees" value={`$${data.feesUsd.toFixed(2)}`} />
        <Metric label="Top" value={data.topRecipient?.recipient ?? "—"} />
      </div>
    </div>
  );
}

/** Tarjeta de desglose por categoría, con donut chart. */
export function CategoryCard({
  data,
}: {
  data: { period: string; breakdown: { category: string; totalUsd: number }[] };
}) {
  const chart = data.breakdown.map((b) => ({ name: b.category, value: b.totalUsd }));
  return (
    <div className="rounded-2xl border p-5 w-full max-w-sm" style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--cb-muted)" }}>
        By category · {data.period}
      </p>
      {chart.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--cb-muted)" }}>No spending yet.</p>
      ) : (
        <>
          <div style={{ width: "100%", height: 160 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chart} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                  {chart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1">
            {data.breakdown.map((b, i) => (
              <li key={b.category} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2" style={{ color: "var(--cb-body)" }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {b.category}
                </span>
                <span className="font-mono" style={{ color: "var(--cb-ink)" }}>${b.totalUsd.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Tarjeta de transacciones recientes con mini gráfica de barras por destinatario. */
export function TransactionsCard({
  data,
}: {
  data: {
    period: string;
    transactions: { recipient: string; amountUsd: number; date: string }[];
    topRecipients: { recipient: string; totalUsd: number }[];
  };
}) {
  return (
    <div className="rounded-2xl border p-5 w-full max-w-sm" style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}>
      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--cb-muted)" }}>
        Recent · {data.period}
      </p>
      {data.topRecipients.length > 0 && (
        <div style={{ width: "100%", height: 120 }}>
          <ResponsiveContainer>
            <BarChart data={data.topRecipients.map((r) => ({ name: r.recipient, value: r.totalUsd }))}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#7c828a" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} />
              <Bar dataKey="value" fill="#0052ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <ul className="mt-3 space-y-1.5 max-h-40 overflow-y-auto">
        {data.transactions.map((t, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <span style={{ color: "var(--cb-body)" }}>{t.recipient}</span>
            <span className="font-mono" style={{ color: "var(--cb-ink)" }}>${t.amountUsd.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-2" style={{ background: "var(--cb-surface-strong)" }}>
      <p className="text-xs" style={{ color: "var(--cb-muted)" }}>{label}</p>
      <p className="text-sm font-medium truncate" style={{ color: "var(--cb-ink)" }}>{value}</p>
    </div>
  );
}
