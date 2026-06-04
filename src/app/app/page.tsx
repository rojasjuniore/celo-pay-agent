"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AuthGate } from "@/components/auth/AuthGate";
import { WelcomeState } from "@/components/chat/WelcomeState";
import { AgentLivePanel } from "@/components/chat/AgentLivePanel";
import { ConfirmationCard } from "@/components/chat/ConfirmationCard";
import type {
  AgentIdentity,
  AgentActivity,
  PaymentConfirmation,
} from "@/components/chat/types";

/** Página /app: protegida por AuthGate (login + KYC) → renderiza el chat. */
export default function AppPage() {
  return (
    <AuthGate>
      <ChatApp />
    </AuthGate>
  );
}

/**
 * UI del agente (estilo ChatGPT, 3 zonas): sidebar · chat · panel live.
 * El chat usa useChat (AI SDK v6) contra /api/chat. La identidad y actividad
 * vienen de datos reales (null hasta que el backend los provea — sin mocks).
 */
function ChatApp() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

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
                            onConfirm={() => submit("Confirmo el pago")}
                            onEdit={() => submit("Quiero cambiar el pago")}
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
    </div>
  );
}
