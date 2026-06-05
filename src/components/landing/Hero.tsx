"use client";

import Link from "next/link";
import { useLang } from "./i18n";

/**
 * Hero oscuro full-bleed (firma Coinbase) con demo del chat. Visible por
 * defecto (sin opacidad 0 inicial que pueda atascarse en prod); la entrada es
 * una animación CSS a prueba de fallos. Copy bilingüe.
 */
export function Hero() {
  const { t } = useLang();
  return (
    <section
      className="relative px-6 md:px-12 py-20 md:py-28 overflow-hidden"
      style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}
    >
      {/* Glow de marca: degradado sutil Celo + azul */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #fcff52 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(circle, #0052ff 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-[1200px] grid md:grid-cols-2 gap-12 items-center">
        <div className="remi-fade-up">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 mb-6"
            style={{ background: "var(--cb-surface-dark-elevated)", color: "var(--cb-on-dark-soft)", borderRadius: "var(--cb-radius-pill)" }}
          >
            {t("badge")}
          </span>
          <h1 className="font-normal" style={{ fontSize: "clamp(44px, 7vw, 84px)", lineHeight: 1, letterSpacing: "-2px" }}>
            {t("heroTitle1")}<br />{t("heroTitle2")}
          </h1>
          <p className="mt-6 text-lg max-w-md" style={{ color: "var(--cb-on-dark-soft)", lineHeight: 1.5 }}>
            {t("heroSub")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/app"
              className="inline-flex items-center h-14 px-8 text-base font-semibold transition-transform hover:scale-[1.03]"
              style={{ background: "var(--cb-primary)", color: "var(--cb-on-dark)", borderRadius: "var(--cb-radius-pill)" }}
            >
              {t("tryRemi")}
            </Link>
            <a
              href="https://github.com/rojasjuniore/celo-pay-agent"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center h-14 px-8 text-base font-semibold border transition-colors hover:bg-white/5"
              style={{ color: "var(--cb-on-dark)", borderColor: "var(--cb-on-dark-soft)", borderRadius: "var(--cb-radius-pill)" }}
            >
              {t("viewCode")}
            </a>
          </div>
          {/* Stats de confianza */}
          <div className="mt-10 flex gap-8">
            <Stat value="0.5%" label={t("statFee")} />
            <Stat value="$0" label={t("statGas")} />
            <Stat value="120+" label={t("statCurrencies")} />
          </div>
        </div>

        <ChatDemo />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-medium font-mono">{value}</p>
      <p className="text-xs mt-1" style={{ color: "var(--cb-on-dark-soft)" }}>{label}</p>
    </div>
  );
}

/** Mockup del chat (visible por defecto, con glow). */
function ChatDemo() {
  const { t } = useLang();
  const rows = [
    { label: t("rowSend"), value: "$50.00 USDT" },
    { label: t("rowFee"), value: "$0.25 (0.5%)", soft: true },
    { label: t("rowReceive"), value: "~$200,000 COP" },
    { label: t("rowGas"), value: "$0", up: true },
    { label: t("rowNetwork"), value: "100% Celo" },
  ];
  return (
    <div
      className="remi-fade-up p-8 shadow-2xl"
      style={{ background: "var(--cb-surface-dark-elevated)", borderRadius: "var(--cb-radius-xl)", animationDelay: "0.15s" }}
    >
      <p className="text-sm mb-3" style={{ color: "var(--cb-on-dark-soft)" }}>{t("you")}</p>
      <div className="px-4 py-3 mb-5 text-sm ml-auto max-w-[90%]" style={{ background: "var(--cb-primary)", borderRadius: 16 }}>
        {t("chatMsg")}
      </div>
      <p className="text-sm mb-3" style={{ color: "var(--cb-on-dark-soft)" }}>Remi</p>
      <div className="px-4 py-4 text-sm space-y-2" style={{ background: "#000", borderRadius: 16 }}>
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between font-mono">
            <span style={{ color: "var(--cb-on-dark-soft)" }}>{r.label}</span>
            <span style={{ color: r.up ? "var(--cb-up)" : r.soft ? "var(--cb-on-dark-soft)" : "var(--cb-on-dark)" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
