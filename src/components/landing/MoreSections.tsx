"use client";

import { motion } from "motion/react";
import { fadeUp, stagger } from "./motion";
import { useLang } from "./i18n";

/** Banda oscura: beneficios del off-ramp Noah (global). */
export function WhyNoah() {
  const { t } = useLang();
  const cards = [
    { tag: t("noah1Title"), d: t("noah1") },
    { tag: t("noah2Title"), d: t("noah2") },
    { tag: t("noah3Title"), d: t("noah3") },
  ];
  return (
    <section className="px-6 md:px-12 py-20 md:py-24" style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-normal mb-3" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-1.3px" }}>
          {t("noahTitle")}
        </h2>
        <p className="mb-12 text-lg max-w-2xl" style={{ color: "var(--cb-on-dark-soft)" }}>{t("noahSub")}</p>
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {cards.map((c) => (
            <motion.div key={c.tag} variants={fadeUp} className="p-8" style={{ background: "var(--cb-surface-dark-elevated)", borderRadius: "var(--cb-radius-xl)" }}>
              <h3 className="text-lg font-semibold mb-2">{c.tag}</h3>
              <p style={{ color: "var(--cb-on-dark-soft)", lineHeight: 1.5 }}>{c.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/** Banda clara: el stack tecnológico real (logos en texto sobrio). */
export function TechStack() {
  const { t } = useLang();
  const stack = [
    { name: "Celo · gasless", d: t("techCelo") },
    { name: "ERC-8004", d: t("techErc") },
    { name: "x402", d: t("techX402") },
    { name: "Self Protocol", d: t("techSelf") },
    { name: "Claude · OpenRouter", d: t("techAi") },
    { name: "Noah", d: t("techNoah") },
  ];
  return (
    <section className="px-6 md:px-12 py-20 md:py-24" style={{ background: "var(--cb-canvas)", color: "var(--cb-ink)" }}>
      <div className="mx-auto max-w-[1200px]">
        <h2 className="font-normal mb-3" style={{ fontSize: "clamp(32px, 4vw, 52px)", lineHeight: 1, letterSpacing: "-1.3px" }}>
          {t("techTitle")}
        </h2>
        <p className="mb-12 text-lg" style={{ color: "var(--cb-body)" }}>{t("techSub")}</p>
        <motion.div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={stagger}
        >
          {stack.map((s) => (
            <motion.div key={s.name} variants={fadeUp} className="p-6 border" style={{ borderColor: "var(--cb-hairline)", borderRadius: "var(--cb-radius-xl)" }}>
              <h3 className="text-base font-semibold mb-2 font-mono" style={{ color: "var(--cb-primary)" }}>{s.name}</h3>
              <p className="text-sm" style={{ color: "var(--cb-body)", lineHeight: 1.5 }}>{s.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
