"use client";

import { motion } from "motion/react";

const SUGGESTIONS = [
  { title: "Send a remittance", sub: "send $50 to my mom in Bogotá" },
  { title: "Recurring payment", sub: "pay $9 to Netflix every month" },
  { title: "Split a bill", sub: "split $80 between 4 friends" },
  { title: "How it works", sub: "how does Remi send money?" },
];

/** Estado inicial del chat. onPick envía la sugerencia como mensaje. */
export function WelcomeState({ onPick }: { onPick: (text: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center gap-6 py-12"
    >
      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-full text-2xl font-semibold"
        style={{ background: "var(--cb-celo)", color: "#000" }}
      >
        R
      </span>
      <div>
        <h1 className="text-3xl font-medium" style={{ color: "var(--cb-ink)" }}>
          Send money by talking
        </h1>
        <p className="mt-2 max-w-sm" style={{ color: "var(--cb-body)" }}>
          Tell Remi what to do, in English or Spanish. Gasless on Celo,
          settled in local currency.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.sub)}
            className="rounded-2xl border p-4 text-left transition-all hover:scale-[1.02] hover:shadow-sm"
            style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--cb-ink)" }}>{s.title}</p>
            <p className="text-xs mt-1" style={{ color: "var(--cb-muted)" }}>{s.sub}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
