"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fadeUp, stagger } from "./motion";
import { useLang } from "./i18n";

/** Banda clara: cómo funciona (3 pasos), animada al hacer scroll. */
export function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { n: "1", t: t("how1Title"), d: t("how1") },
    { n: "2", t: t("how2Title"), d: t("how2") },
    { n: "3", t: t("how3Title"), d: t("how3") },
  ];
  return (
    <section className="px-6 md:px-12 py-20 md:py-24" style={{ background: "var(--cb-canvas)", color: "var(--cb-ink)" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-normal mb-12" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-1.3px" }}>
          {t("howTitle")}
        </h2>
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {steps.map((s) => (
            <motion.div key={s.n} variants={fadeUp} className="p-8 border" style={{ borderColor: "var(--cb-hairline)", borderRadius: "var(--cb-radius-xl)" }}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold mb-4" style={{ background: "var(--cb-surface-strong)", color: "var(--cb-ink)" }}>{s.n}</span>
              <h3 className="text-lg font-semibold mb-2">{s.t}</h3>
              <p style={{ color: "var(--cb-body)", lineHeight: 1.5 }}>{s.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** Banda gris: los 3 tracks del hackatón. */
export function Tracks() {
  const { t } = useLang();
  const tracks = [
    { tag: t("track1Tag"), d: t("track1") },
    { tag: t("track2Tag"), d: t("track2") },
    { tag: t("track3Tag"), d: t("track3") },
  ];
  return (
    <section className="px-6 md:px-12 py-20 md:py-24" style={{ background: "var(--cb-surface-soft)", color: "var(--cb-ink)" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-normal mb-3" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-1.3px" }}>
          {t("tracksTitle")}
        </h2>
        <p className="mb-12 text-lg" style={{ color: "var(--cb-body)" }}>{t("tracksSub")}</p>
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {tracks.map((tr) => (
            <motion.div key={tr.tag} variants={fadeUp} className="p-8" style={{ background: "var(--cb-canvas)", borderRadius: "var(--cb-radius-xl)" }}>
              <span className="inline-block text-xs font-semibold uppercase px-3 py-1 mb-4" style={{ background: "var(--cb-surface-strong)", borderRadius: "var(--cb-radius-pill)" }}>{tr.tag}</span>
              <p style={{ color: "var(--cb-body)", lineHeight: 1.5 }}>{tr.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** CTA band oscuro pre-footer. */
export function CtaBand() {
  const { t } = useLang();
  return (
    <section className="px-6 md:px-12 py-24 text-center" style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-normal mx-auto max-w-2xl"
        style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1.05, letterSpacing: "-1.3px" }}
      >
        {t("ctaTitle")}
      </motion.h2>
      <Link href="/app" className="inline-flex items-center h-14 px-8 mt-8 text-base font-semibold transition-transform hover:scale-[1.03]" style={{ background: "var(--cb-primary)", color: "var(--cb-on-dark)", borderRadius: "var(--cb-radius-pill)" }}>
        {t("ctaButton")}
      </Link>
    </section>
  );
}

/** Footer claro. */
export function Footer() {
  const { t } = useLang();
  return (
    <footer className="px-6 md:px-12 py-12" style={{ background: "var(--cb-canvas)", color: "var(--cb-body)" }}>
      <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row justify-between gap-4 text-sm">
        <span>{t("footerLeft")}</span>
        <span style={{ color: "var(--cb-muted)" }}>{t("footerRight")}</span>
      </div>
    </footer>
  );
}
