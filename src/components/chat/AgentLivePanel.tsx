import type { AgentIdentity, AgentActivity } from "./types";
import { scan8004 } from "./explorer";

/**
 * Panel derecho: identidad ERC-8004/Self + actividad onchain en vivo.
 * Datos reales por props (de la API/DB). Si no hay datos, muestra estado vacío.
 */
export function AgentLivePanel({
  identity,
  activity,
}: {
  identity: AgentIdentity | null;
  activity: AgentActivity | null;
}) {
  return (
    <aside
      className="w-72 shrink-0 border-l p-5 space-y-4 hidden lg:block"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <Card title="Identidad">
        <div className="flex items-center gap-2 mb-2">
          <span className="h-6 w-6 rounded-full inline-flex items-center justify-center text-xs" style={{ background: "var(--color-celo)" }}>🤖</span>
          <span className="font-medium" style={{ color: "var(--color-primary)" }}>PagaBot</span>
        </div>
        {identity?.agentId ? (
          <a href={scan8004(identity.agentId)} target="_blank" rel="noreferrer" className="text-xs font-mono block" style={{ color: "var(--color-tertiary)" }}>
            ✅ ERC-8004 #{identity.agentId} ↗
          </a>
        ) : (
          <p className="text-xs" style={{ color: "var(--color-neutral)" }}>Sin registrar aún</p>
        )}
        {identity?.selfVerified && (
          <p className="text-xs mt-1" style={{ color: "var(--color-success)" }}>🛡 Self verificado</p>
        )}
      </Card>

      <Card title="Actividad onchain">
        {activity ? (
          <dl className="space-y-1 text-sm">
            <Stat label="Tx onchain" value={String(activity.txCount)} />
            <Stat label="Volumen" value={`$${activity.volumeUsd.toFixed(2)}`} />
            <Stat label="Gas pagado" value={`$${activity.gasPaidUsd.toFixed(2)} (en USDT)`} />
          </dl>
        ) : (
          <p className="text-xs" style={{ color: "var(--color-neutral)" }}>Sin actividad todavía</p>
        )}
      </Card>
    </aside>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border p-4" style={{ borderColor: "var(--color-border)" }}>
      <h4 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "var(--color-neutral)" }}>{title}</h4>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt style={{ color: "var(--color-neutral)" }}>{label}</dt>
      <dd className="font-mono" style={{ color: "var(--color-primary)" }}>{value}</dd>
    </div>
  );
}
