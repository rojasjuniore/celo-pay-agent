"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Stepper } from "@/components/onboarding/Stepper";
import { SelfStep } from "@/components/onboarding/SelfStep";
import {
  canAdvance,
  nextStep,
  type OnboardingState,
} from "@/modules/onboarding/steps";

/**
 * Onboarding KYC de Remi: cuenta → perfil → verificación Self (ZK passport) →
 * listo (confetti). Estilo Coinbase, animado con motion. La verificación es real
 * (SelfStep monta el QR; el endpoint /api/self/verify valida el proof).
 */
export default function Onboarding() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState>({
    step: "account",
    selfVerified: false,
  });

  const advance = () => setState((s) => ({ ...s, step: nextStep(s) }));
  const set = (patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch }));

  // Endpoint público del verifier Self + scope (de config pública en runtime).
  const selfEndpoint =
    process.env.NEXT_PUBLIC_SELF_ENDPOINT ?? "https://remi.example/api/self/verify";
  const selfScope = process.env.NEXT_PUBLIC_SELF_SCOPE ?? "remi-kyc";
  // userId para Self: un id estable por sesión de onboarding (hex).
  const [userId] = useState(
    () => "0x" + Array.from({ length: 40 }, (_, i) => ((i * 7 + 3) % 16).toString(16)).join(""),
  );

  useEffect(() => {
    if (state.step === "done") {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    }
  }, [state.step]);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "var(--cb-canvas)" }}>
      <nav className="h-16 flex items-center px-6 md:px-12 border-b" style={{ borderColor: "var(--cb-hairline)" }}>
        <span className="flex items-center gap-2 text-xl font-medium" style={{ color: "var(--cb-ink)" }}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm" style={{ background: "var(--cb-celo)", color: "#000" }}>R</span>
          Remi
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <Stepper current={state.step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
            >
              {state.step === "account" && (
                <StepCard title="Create your account" subtitle="Just your email to start.">
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={state.email ?? ""}
                    onChange={(e) => set({ email: e.target.value })}
                    className="w-full h-12 px-4 border outline-none"
                    style={{ borderColor: "var(--cb-hairline)", borderRadius: 12 }}
                  />
                  <PrimaryButton disabled={!canAdvance(state)} onClick={advance}>Continue</PrimaryButton>
                </StepCard>
              )}

              {state.step === "profile" && (
                <StepCard title="Tell us about you" subtitle="Required to send money internationally.">
                  <input
                    placeholder="Full name"
                    value={state.fullName ?? ""}
                    onChange={(e) => set({ fullName: e.target.value })}
                    className="w-full h-12 px-4 border outline-none"
                    style={{ borderColor: "var(--cb-hairline)", borderRadius: 12 }}
                  />
                  <input
                    placeholder="Country code (e.g. CO, MX, US)"
                    maxLength={2}
                    value={state.country ?? ""}
                    onChange={(e) => set({ country: e.target.value.toUpperCase() })}
                    className="w-full h-12 px-4 border outline-none uppercase"
                    style={{ borderColor: "var(--cb-hairline)", borderRadius: 12 }}
                  />
                  <PrimaryButton disabled={!canAdvance(state)} onClick={advance}>Continue</PrimaryButton>
                </StepCard>
              )}

              {state.step === "verify" && (
                <SelfStep
                  userId={userId}
                  endpoint={selfEndpoint}
                  scope={selfScope}
                  onVerified={() => {
                    set({ selfVerified: true });
                    setTimeout(advance, 400);
                  }}
                />
              )}

              {state.step === "done" && (
                <div className="text-center">
                  <div
                    className="mx-auto mb-5 h-14 w-14 rounded-full flex items-center justify-center text-2xl"
                    style={{ background: "var(--cb-up)", color: "#fff" }}
                  >
                    ✓
                  </div>
                  <h2 className="text-3xl font-medium mb-2" style={{ color: "var(--cb-ink)" }}>You&apos;re in.</h2>
                  <p className="mb-8" style={{ color: "var(--cb-body)" }}>
                    Verified with a zero-knowledge proof. Ready to send money by talking.
                  </p>
                  <PrimaryButton onClick={() => router.push("/app")}>Open Remi</PrimaryButton>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

function StepCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-medium" style={{ color: "var(--cb-ink)" }}>{title}</h2>
      <p style={{ color: "var(--cb-body)" }}>{subtitle}</p>
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="h-12 px-6 text-base font-semibold transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
      style={{ background: "var(--cb-primary)", color: "#fff", borderRadius: 100 }}
    >
      {children}
    </button>
  );
}
