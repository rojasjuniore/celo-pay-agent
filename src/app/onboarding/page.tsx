"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b" style={{ borderColor: "var(--cb-hairline)" }}>
        <Link href="/" className="flex items-center gap-2 text-xl font-medium" style={{ color: "var(--cb-ink)" }}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold" style={{ background: "var(--cb-celo)", color: "#000" }}>R</span>
          Remi
        </Link>
        <Link href="/app" className="text-sm font-medium" style={{ color: "var(--cb-primary)" }}>Open chat</Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <p className="mb-6 text-xs px-3 py-1 rounded-full" style={{ background: "var(--cb-surface-strong)", color: "var(--cb-muted)" }}>
          KYC demo · in the live flow this happens inside the chat, only when you pay
        </p>
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
                <StepCard title="Send money home in seconds" subtitle="Just your email — we create a gasless wallet for you. No seed phrase, no gas.">
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
                <StepCard title="Where are we sending?" subtitle="Your details settle the payment in local currency — pesos, soles, reais.">
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
                <div className="flex flex-col gap-5">
                  <SelfStep
                    userId={userId}
                    endpoint={selfEndpoint}
                    scope={selfScope}
                    onVerified={() => {
                      set({ selfVerified: true });
                      setTimeout(advance, 400);
                    }}
                  />
                  {/* Bullets de confianza: el QR no se ve solo en el video. */}
                  <ul className="mx-auto max-w-sm flex flex-col gap-2 text-sm" style={{ color: "var(--cb-body)" }}>
                    {[
                      "Zero-knowledge: your passport never leaves your phone",
                      "Sybil-resistant proof you're a real human",
                      "Meets KYC to move money — required by law",
                    ].map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <span style={{ color: "var(--cb-up)" }}>✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {state.step === "done" && (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="mx-auto mb-5 h-16 w-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ background: "var(--cb-up)", color: "#fff" }}
                  >
                    ✓
                  </motion.div>
                  <h2 className="text-3xl font-medium mb-2" style={{ color: "var(--cb-ink)" }}>You&apos;re verified.</h2>
                  <p className="mb-8" style={{ color: "var(--cb-body)" }}>
                    No bank, no branch, no waiting. Just talk to Remi and money moves —
                    gasless on Celo, settled in local currency.
                  </p>
                  <PrimaryButton onClick={() => router.push("/app")}>Send your first payment</PrimaryButton>
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
      // Acento Celo amarillo. Texto NEGRO obligatorio: blanco sobre #FCFF52 es
      // ilegible (falla contraste WCAG) — el amarillo es muy claro.
      className="h-12 px-6 text-base font-semibold transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
      style={{ background: "var(--cb-celo)", color: "#000", borderRadius: 100 }}
    >
      {children}
    </button>
  );
}
