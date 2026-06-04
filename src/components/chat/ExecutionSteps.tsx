import type { ExecutionStep } from "./types";
import { celoscanTx, shortHash } from "./explorer";

const ICON: Record<ExecutionStep["status"], string> = {
  pending: "○",
  running: "⏳",
  done: "✅",
  failed: "❌",
};

/** Pasos de ejecución onchain en vivo. Datos reales por props. */
export function ExecutionSteps({ steps }: { steps: ExecutionStep[] }) {
  return (
    <div
      className="rounded-[12px] border p-6 max-w-md font-mono text-sm"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden>{ICON[s.status]}</span>
            <span style={{ color: "var(--color-primary)" }}>{s.label}</span>
            {s.txHash && (
              <a
                href={celoscanTx(s.txHash)}
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--color-tertiary)" }}
              >
                {shortHash(s.txHash)} ↗
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
