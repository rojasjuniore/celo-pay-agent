"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { WelcomeState } from "@/components/chat/WelcomeState";
import { AgentLivePanel } from "@/components/chat/AgentLivePanel";
import { ConfirmationCard } from "@/components/chat/ConfirmationCard";
import { PaymentGate } from "@/components/chat/PaymentGate";
import { usePaymentGate } from "@/components/auth/usePaymentGate";
import type {
  AgentIdentity,
  AgentActivity,
  PaymentConfirmation,
} from "@/components/chat/types";

/**
 * Página /app: el chat de Remi en GUEST MODE (sin login para explorar).
 * El login + KYC (Self) se piden just-in-time, dentro del chat, solo cuando el
 * usuario confirma un pago — el flujo que mejor convierte (investigación).
 */
export default function AppPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");
  const gate = usePaymentGate();
  // Pago pendiente de ejecutar tras pasar el gate (login + KYC).
  const [pending, setPending] = useState<PaymentConfirmation | null>(null);

  // Hasta cablear el feed real desde la DB/onchain, no inventamos datos.
  const identity: AgentIdentity | null = null;
  const activity: AgentActivity | null = null;

  const submit = (text: string) => {
    const value = text.trim();
    if (!value) return;
    sendMessage({ text: value });
    setInput("");
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--color-surface-muted)" }}>
      {/* Sidebar */}
      <nav
        className="w-60 shrink-0 border-r p-4 hidden md:flex flex-col gap-2"
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        <button
          className="h-10 rounded-[8px] text-sm font-medium border"
          style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
        >
          + Nueva conversación
        </button>
        <p className="text-xs mt-4" style={{ color: "var(--color-neutral)" }}>
          Historial
        </p>
      </nav>

      {/* Chat */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.length === 0 ? (
              <WelcomeState onPick={submit} />
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className="rounded-[12px] px-4 py-2 max-w-[80%] text-sm"
                    style={{
                      background:
                        m.role === "user" ? "var(--color-primary)" : "var(--color-surface)",
                      color:
                        m.role === "user" ? "var(--color-on-primary)" : "var(--color-primary)",
                      border: m.role === "user" ? "none" : "1px solid var(--color-border)",
                    }}
                  >
                    {m.parts.map((p, i) => {
                      if (p.type === "text") return <span key={i}>{p.text}</span>;
                      // Tool call: el agente propone un pago → tarjeta de confirmación.
                      if (
                        p.type === "tool-proposePayment" &&
                        p.state === "output-available"
                      ) {
                        const o = p.output as {
                          intent: PaymentConfirmation;
                          feeUsd: number;
                          netUsd: number;
                          feeBps: number;
                        };
                        const data: PaymentConfirmation = {
                          ...o.intent,
                          feeUsd: o.feeUsd,
                          netUsd: o.netUsd,
                          feeBps: o.feeBps,
                        };
                        return (
                          <ConfirmationCard
                            key={i}
                            data={data}
                            onConfirm={() => {
                              // Gate just-in-time: si falta login/KYC, lo pide
                              // ahora (PaymentGate); si ya está, ejecuta.
                              if (gate.ready) submit("Confirm the payment");
                              else setPending(data);
                            }}
                            onEdit={() => submit("I want to change the payment")}
                          />
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))
            )}
            {status === "streaming" && (
              <p className="text-xs" style={{ color: "var(--color-neutral)" }}>
                PagaBot está escribiendo…
              </p>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t p-4" style={{ borderColor: "var(--color-border)" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="mx-auto max-w-2xl flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe… (ES/EN)"
              className="flex-1 h-10 px-3 rounded-[8px] border text-sm"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            />
            <button
              type="submit"
              disabled={status === "streaming"}
              className="h-10 px-5 rounded-[8px] text-sm font-medium disabled:opacity-50"
              style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
            >
              Enviar
            </button>
          </form>
        </div>
      </main>

      {/* Panel live */}
      <AgentLivePanel identity={identity} activity={activity} />

      {/* Gate just-in-time: login + KYC, solo al confirmar un pago */}
      {pending && (
        <PaymentGate
          gate={gate}
          onReady={() => {
            setPending(null);
            submit("Confirm the payment");
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
