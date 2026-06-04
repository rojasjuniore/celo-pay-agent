import Link from "next/link";

/** Banda clara: cómo funciona (3 pasos). */
export function HowItWorks() {
  const steps = [
    { n: "1", t: "Habla normal", d: "“send $50 to my mom in Bogotá”. En español o inglés. Remi entiende la intención." },
    { n: "2", t: "Confirma", d: "Remi muestra el monto, el fee (0.5%, transparente) y lo que recibe — antes de mover nada." },
    { n: "3", t: "Listo", d: "Ejecuta gasless en Celo y liquida a moneda local. Recibo con links a Celoscan." },
  ];
  return (
    <section className="px-6 md:px-12 py-20 md:py-24" style={{ background: "var(--cb-canvas)", color: "var(--cb-ink)" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-normal mb-12" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-1.3px" }}>
          Cómo funciona
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.n} className="p-8 border" style={{ borderColor: "var(--cb-hairline)", borderRadius: "var(--cb-radius-xl)" }}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold mb-4" style={{ background: "var(--cb-surface-strong)", color: "var(--cb-ink)" }}>{s.n}</span>
              <h3 className="text-lg font-semibold mb-2">{s.t}</h3>
              <p style={{ color: "var(--cb-body)", lineHeight: 1.5 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Banda gris suave: los 3 tracks del hackatón. */
export function Tracks() {
  const tracks = [
    { tag: "Best Agent", d: "Utilidad real: remesas gasless con off-ramp global. Agente con agencia económica propia." },
    { tag: "Most Activity", d: "Cada remesa = varias tx en Celo. El cron autónomo re-ejecuta pagos recurrentes." },
    { tag: "8004scan Rank", d: "Identidad on-chain en ERC-8004, verificada con Self Agent ID (proof-of-human)." },
  ];
  return (
    <section className="px-6 md:px-12 py-20 md:py-24" style={{ background: "var(--cb-surface-soft)", color: "var(--cb-ink)" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-normal mb-3" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-1.3px" }}>
          Diseñado para ganar
        </h2>
        <p className="mb-12 text-lg" style={{ color: "var(--cb-body)" }}>Un agente que compite en los 3 tracks.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {tracks.map((t) => (
            <div key={t.tag} className="p-8" style={{ background: "var(--cb-canvas)", borderRadius: "var(--cb-radius-xl)" }}>
              <span className="inline-block text-xs font-semibold uppercase px-3 py-1 mb-4" style={{ background: "var(--cb-surface-strong)", borderRadius: "var(--cb-radius-pill)" }}>{t.tag}</span>
              <p style={{ color: "var(--cb-body)", lineHeight: 1.5 }}>{t.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** CTA band oscuro pre-footer. */
export function CtaBand() {
  return (
    <section className="px-6 md:px-12 py-24 text-center" style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}>
      <h2 className="font-normal mx-auto max-w-2xl" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05, letterSpacing: "-1.3px" }}>
        Manda tu primera remesa hablando.
      </h2>
      <Link href="/app" className="inline-flex items-center h-14 px-8 mt-8 text-base font-semibold" style={{ background: "var(--cb-primary)", color: "var(--cb-on-dark)", borderRadius: "var(--cb-radius-pill)" }}>
        Abrir Remi
      </Link>
    </section>
  );
}

/** Footer claro. */
export function Footer() {
  return (
    <footer className="px-6 md:px-12 py-12" style={{ background: "var(--cb-canvas)", color: "var(--cb-body)" }}>
      <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row justify-between gap-4 text-sm">
        <span>Remi · agente de pagos en Celo</span>
        <span style={{ color: "var(--cb-muted)" }}>Onchain Agents Hackathon 2026 · MIT</span>
      </div>
    </footer>
  );
}
