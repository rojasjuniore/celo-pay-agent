import Link from "next/link";

/**
 * Hero oscuro full-bleed (firma Coinbase) con tarjeta product-UI flotante.
 * Display weight 400, letter-spacing negativo, CTA pill azul.
 */
export function Hero() {
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28"
      style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}
    >
      <div className="mx-auto max-w-[1200px] grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 mb-6"
            style={{ background: "var(--cb-surface-dark-elevated)", color: "var(--cb-on-dark-soft)", borderRadius: "var(--cb-radius-pill)" }}
          >
            Onchain Agents Hackathon · Celo
          </span>
          <h1
            className="font-normal"
            style={{ fontSize: "clamp(40px, 7vw, 80px)", lineHeight: 1, letterSpacing: "-2px" }}
          >
            Envía dinero hablando.
          </h1>
          <p className="mt-6 text-lg max-w-md" style={{ color: "var(--cb-on-dark-soft)", lineHeight: 1.5 }}>
            Remi es un agente de IA que ejecuta remesas reales en Celo. Gasless,
            sin que toques una sola pieza de cripto, liquidado en moneda local.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="inline-flex items-center h-14 px-8 text-base font-semibold"
              style={{ background: "var(--cb-primary)", color: "var(--cb-on-dark)", borderRadius: "var(--cb-radius-pill)" }}
            >
              Probar Remi
            </Link>
            <a
              href="https://github.com/rojasjuniore/celo-pay-agent"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center h-14 px-8 text-base font-semibold border"
              style={{ color: "var(--cb-on-dark)", borderColor: "var(--cb-on-dark-soft)", borderRadius: "var(--cb-radius-pill)" }}
            >
              Ver el código
            </a>
          </div>
        </div>

        {/* Tarjeta product-UI flotante (mockup del chat) */}
        <div
          className="p-8"
          style={{ background: "var(--cb-surface-dark-elevated)", borderRadius: "var(--cb-radius-xl)" }}
        >
          <p className="text-sm mb-4" style={{ color: "var(--cb-on-dark-soft)" }}>Tú</p>
          <div className="px-4 py-3 mb-5 text-sm" style={{ background: "var(--cb-primary)", borderRadius: 16 }}>
            manda $50 a mi mamá en Bogotá cada quincena
          </div>
          <p className="text-sm mb-3" style={{ color: "var(--cb-on-dark-soft)" }}>Remi</p>
          <div className="px-4 py-4 text-sm space-y-2" style={{ background: "#000", borderRadius: 16 }}>
            <Row label="Envías" value="$50.00 USDT" />
            <Row label="Fee servicio" value="$0.25 (0.5%)" soft />
            <Row label="Recibe" value="~$200.000 COP" />
            <Row label="Gas" value="$0 ⚡" up />
            <Row label="Red" value="100% Celo" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, soft, up }: { label: string; value: string; soft?: boolean; up?: boolean }) {
  return (
    <div className="flex justify-between font-mono">
      <span style={{ color: "var(--cb-on-dark-soft)" }}>{label}</span>
      <span style={{ color: up ? "var(--cb-up)" : soft ? "var(--cb-on-dark-soft)" : "var(--cb-on-dark)" }}>{value}</span>
    </div>
  );
}
