"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { LoginButton } from "@/components/auth/LoginButton";
import { SelfStep } from "@/components/onboarding/SelfStep";
import type { PaymentGateState } from "@/components/auth/usePaymentGate";

/**
 * Gate just-in-time (overlay dentro del chat). Aparece al confirmar un pago:
 *   falta login → ConnectButton; falta KYC → SelfStep (QR real); listo → onReady.
 * No bloquea el chat: solo se monta cuando hay un pago pendiente.
 */
export function PaymentGate({
  gate,
  onReady,
  onCancel,
}: {
  gate: PaymentGateState;
  onReady: () => void;
  onCancel: () => void;
}) {
  // En cuanto el gate queda listo (login + KYC), ejecuta.
  useEffect(() => {
    if (gate.ready) onReady();
  }, [gate.ready, onReady]);

  const selfEndpoint =
    process.env.NEXT_PUBLIC_SELF_ENDPOINT ?? "https://remi.example/api/self/verify";
  const selfScope = process.env.NEXT_PUBLIC_SELF_SCOPE ?? "remi-kyc";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl"
        style={{ background: "var(--cb-canvas)" }}
      >
        {gate.missing === "login" && (
          <div className="flex flex-col items-center text-center gap-5">
            <h2 className="text-2xl font-medium" style={{ color: "var(--cb-ink)" }}>
              One step to send
            </h2>
            <p className="max-w-sm" style={{ color: "var(--cb-body)" }}>
              Sign in to execute the payment. Email or wallet — we create a gasless
              wallet for you automatically.
            </p>
            <LoginButton label="Sign in to send" />
          </div>
        )}

        {gate.missing === "kyc" && gate.address && (
          <SelfStep
            userId={gate.address}
            endpoint={selfEndpoint}
            scope={selfScope}
            onVerified={() => {
              // No marcamos nada desde el cliente (sería un bypass de KYC). El
              // QR apunta a /api/self/verify, que valida el ZK proof y persiste
              // kycVerified server-side. usePaymentGate lo detecta por polling.
            }}
          />
        )}

        <button
          onClick={onCancel}
          className="mt-6 w-full text-sm"
          style={{ color: "var(--cb-muted)" }}
        >
          Cancel
        </button>
      </motion.div>
    </div>
  );
}
