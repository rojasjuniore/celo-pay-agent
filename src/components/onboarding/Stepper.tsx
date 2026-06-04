"use client";

import { motion } from "motion/react";
import { ONBOARDING_STEPS, stepIndex, type OnboardingStep } from "@/modules/onboarding/steps";

const LABELS: Record<OnboardingStep, string> = {
  account: "Account",
  profile: "Profile",
  verify: "Verify",
  done: "Done",
};

/** Barra de progreso + pasos con checkmarks animados. */
export function Stepper({ current }: { current: OnboardingStep }) {
  const idx = stepIndex(current);
  return (
    <div className="w-full max-w-md mx-auto mb-10">
      <div className="flex justify-between mb-3">
        {ONBOARDING_STEPS.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={s} className="flex flex-col items-center gap-1 flex-1">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: done || active ? "var(--cb-primary)" : "var(--cb-surface-strong)",
                  scale: active ? 1.1 : 1,
                }}
                className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ color: done || active ? "#fff" : "var(--cb-muted)" }}
              >
                {done ? "✓" : i + 1}
              </motion.div>
              <span className="text-xs" style={{ color: active ? "var(--cb-ink)" : "var(--cb-muted)" }}>
                {LABELS[s]}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--cb-surface-strong)" }}>
        <motion.div
          className="h-full"
          style={{ background: "var(--cb-primary)" }}
          initial={false}
          animate={{ width: `${(idx / (ONBOARDING_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
