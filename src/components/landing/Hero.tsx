"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, stagger } from "./motion";
import { useLang } from "./i18n";

/**
 * Hero oscuro full-bleed (firma Coinbase) con demo animada del chat.
 * Copy bilingüe (toggle EN/ES). El mockup se revela en secuencia.
 */
export function Hero() {
  const { t } = useLang();
  return (
    <section
      className="px-6 md:px-12 py-20 md:py-28 overflow-hidden"
      style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}
    >
      <div className="mx-auto max-w-[1200px] grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-semibold uppercase tracking-wide px-3 py-1 mb-6"
            style={{ background: "var(--cb-surface-dark-elevated)", color: "var(--cb-on-dark-soft)", borderRadius: "var(--cb-radius-pill)" }}
          >
            {t("badge")}
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="font-normal"
            style={{ fontSize: "clamp(44px, 7vw, 84px)", lineHeight: 1, letterSpacing: "-2px" }}
          >
            {t("heroTitle1")}<br />{t("heroTitle2")}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-lg max-w-md" style={{ color: "var(--cb-on-dark-soft)", lineHeight: 1.5 }}>
            {t("heroSub")}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
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
          </motion.div>
        </motion.div>

        <ChatDemo />
      </div>
    </section>
  );
}

/** Mockup del chat que se revela en secuencia (efecto "wow"). */
function ChatDemo() {
  const { t } = useLang();
  const rows = [
    { label: t("rowSend"), value: "$50.00 USDT", delay: 1.0 },
    { label: t("rowFee"), value: "$0.25 (0.5%)", delay: 1.2, soft: true },
    { label: t("rowReceive"), value: "~$200,000 COP", delay: 1.4 },
    { label: t("rowGas"), value: "$0", delay: 1.6, up: true },
    { label: t("rowNetwork"), value: "100% Celo", delay: 1.8 },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="p-8"
      style={{ background: "var(--cb-surface-dark-elevated)", borderRadius: "var(--cb-radius-xl)" }}
    >
      <p className="text-sm mb-3" style={{ color: "var(--cb-on-dark-soft)" }}>{t("you")}</p>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="px-4 py-3 mb-5 text-sm ml-auto max-w-[90%]"
        style={{ background: "var(--cb-primary)", borderRadius: 16 }}
      >
        {t("chatMsg")}
      </motion.div>
      <p className="text-sm mb-3" style={{ color: "var(--cb-on-dark-soft)" }}>Remi</p>
      <div className="px-4 py-4 text-sm space-y-2" style={{ background: "#000", borderRadius: 16 }}>
        {rows.map((r) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: r.delay, duration: 0.3 }}
            className="flex justify-between font-mono"
          >
            <span style={{ color: "var(--cb-on-dark-soft)" }}>{r.label}</span>
            <span style={{ color: r.up ? "var(--cb-up)" : r.soft ? "var(--cb-on-dark-soft)" : "var(--cb-on-dark)" }}>{r.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
