"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useActiveAccount } from "thirdweb/react";
import { buildAuthMessage } from "@/modules/payments/auth-message";
import { WelcomeState } from "@/components/chat/WelcomeState";
import { ConfirmationCard } from "@/components/chat/ConfirmationCard";
import { SummaryCard, CategoryCard, TransactionsCard } from "@/components/chat/SummaryCard";
import { PaymentGate } from "@/components/chat/PaymentGate";
import { usePaymentGate } from "@/components/auth/usePaymentGate";
import { useSessionLogin } from "@/components/auth/useSessionLogin";
import { BalanceCard, DepositCard, ActivityList } from "@/components/dashboard/DashboardCards";
import type { PaymentConfirmation } from "@/components/chat/types";

/** Instante actual (fuera del render: lo usa el handler de ejecución). */
function nowMs(): number {
  return Date.now();
}

/**
 * Página /app: el chat de Remi en GUEST MODE (sin login para explorar).
 * El login + KYC (Self) se piden just-in-time, dentro del chat, solo cuando el
 * usuario confirma un pago — el flujo que mejor convierte (investigación).
 */
export default function AppPage() {
  const account = useActiveAccount();
  // Inicia sesión firmada al conectar la wallet: la identidad para las consultas
  // financieras se establece server-side (cookie), no por el body → sin IDOR.
  useSessionLogin(account);
  // Transport del chat. La identidad va por la cookie de sesión, no en el body.
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const gate = usePaymentGate();
  // Pago pendiente de ejecutar tras pasar el gate (login + KYC).
  const [pending, setPending] = useState<PaymentConfirmation | null>(null);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value) return;
    sendMessage({ text: value });
    setInput("");
  };

  // Ejecuta el pago de verdad (tx reales en Celo) vía /api/execute. El usuario
  // FIRMA el intent con su wallet (autorización server-side). Sin simulación.
  const execute = async (data: PaymentConfirmation) => {
    if (!account) return;
    sendMessage({ text: "Executing payment on Celo…" });
    try {
      const issuedAtMs = nowMs();
      const nonce = crypto.randomUUID();
      const intent = {
        type: data.type,
        amountUsd: data.amountUsd,
        recipient: data.recipient,
        country: data.country,
        schedule: data.schedule,
      };
      const signature = await account.signMessage({
        message: buildAuthMessage(intent, issuedAtMs, nonce),
      });
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, signature, wallet: account.address, issuedAtMs, nonce }),
      });
      const receipt = (await res.json()) as {
        completed: boolean;
        transferHash?: string;
        offRampRef?: string;
      };
      if (receipt.completed) {
        sendMessage({
          text: `Sent. Tx: ${receipt.transferHash ?? "—"}${receipt.offRampRef ? ` · payout ${receipt.offRampRef}` : ""}`,
        });
      } else {
        sendMessage({ text: "Payment could not complete. Check your balance and try again." });
      }
    } catch {
      sendMessage({ text: "Execution error. Please try again." });
    }
  };

  return (
    <div className="flex h-screen" style={{ background: "var(--cb-surface-soft)" }}>
      {/* Sidebar */}
      <nav
        className="w-64 shrink-0 border-r p-4 hidden md:flex flex-col gap-3"
        style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-medium px-2 py-1" style={{ color: "var(--cb-ink)" }}>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold" style={{ background: "var(--cb-celo)", color: "#000" }}>R</span>
          Remi
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="h-10 rounded-full text-sm font-semibold transition-transform hover:scale-[1.02]"
          style={{ background: "var(--cb-surface-strong)", color: "var(--cb-ink)" }}
        >
          New chat
        </button>
        <div className="mt-2 px-2">
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--cb-muted)" }}>Try</p>
          {["Send $50 to Colombia", "Recurring payment", "How does Remi work?"].map((s) => (
            <button key={s} onClick={() => submit(s)} className="block w-full text-left text-sm py-1.5 px-2 rounded-lg transition-colors hover:bg-black/5" style={{ color: "var(--cb-body)" }}>
              {s}
            </button>
          ))}
        </div>
        <div className="mt-auto px-2 text-xs" style={{ color: "var(--cb-muted)" }}>
          Gasless on Celo · settled anywhere
        </div>
      </nav>

      {/* Chat */}
      <main className="flex-1 flex flex-col" style={{ background: "var(--cb-canvas)" }}>
        {/* Header */}
        <div className="h-14 flex items-center px-6 border-b" style={{ borderColor: "var(--cb-hairline)" }}>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold" style={{ background: "var(--cb-celo)", color: "#000" }}>R</span>
            <div>
              <p className="text-sm font-semibold leading-none" style={{ color: "var(--cb-ink)" }}>Remi</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: "var(--cb-up)" }}>● online</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.length === 0 ? (
              <WelcomeState onPick={submit} />
            ) : (
              messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={m.role === "user" ? "flex justify-end" : "flex justify-start items-start gap-2"}
                >
                  {m.role !== "user" && (
                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "var(--cb-celo)", color: "#000" }}>R</span>
                  )}
                  <div
                    className="rounded-2xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed"
                    style={{
                      background: m.role === "user" ? "var(--cb-primary)" : "var(--cb-surface-strong)",
                      color: m.role === "user" ? "#fff" : "var(--cb-ink)",
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
                              if (gate.ready) void execute(data);
                              else setPending(data);
                            }}
                            onEdit={() => submit("I want to change the payment")}
                          />
                        );
                      }
                      // Tools contables → tarjetas con gráficas (datos reales).
                      if (p.type === "tool-getSpendingSummary" && p.state === "output-available") {
                        const o = p.output as Record<string, unknown>;
                        if (!o.error) return <SummaryCard key={i} data={o as never} />;
                      }
                      if (p.type === "tool-getCategoryBreakdown" && p.state === "output-available") {
                        const o = p.output as Record<string, unknown>;
                        if (!o.error) return <CategoryCard key={i} data={o as never} />;
                      }
                      if (p.type === "tool-listTransactions" && p.state === "output-available") {
                        const o = p.output as Record<string, unknown>;
                        if (!o.error) return <TransactionsCard key={i} data={o as never} />;
                      }
                      return null;
                    })}
                  </div>
                </motion.div>
              ))
            )}
            {status === "streaming" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "var(--cb-celo)", color: "#000" }}>R</span>
                <div className="flex gap-1 px-3 py-2 rounded-2xl" style={{ background: "var(--cb-surface-strong)" }}>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--cb-muted)" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t p-4" style={{ borderColor: "var(--cb-hairline)" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="mx-auto max-w-2xl flex gap-2 items-center rounded-full border px-2 py-1"
            style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Remi… (EN / ES)"
              className="flex-1 h-10 px-3 bg-transparent text-sm outline-none"
              style={{ color: "var(--cb-ink)" }}
            />
            <button
              type="submit"
              disabled={status === "streaming" || !input.trim()}
              className="h-9 px-5 rounded-full text-sm font-semibold transition-transform hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
              style={{ background: "var(--cb-primary)", color: "#fff" }}
            >
              Send
            </button>
          </form>
        </div>
      </main>

      {/* Panel live: datos reales onchain (balance, depósito, actividad) */}
      <aside
        className="w-80 shrink-0 border-l p-4 space-y-4 overflow-y-auto hidden lg:block"
        style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-surface-soft)" }}
      >
        <BalanceCard />
        <DepositCard address={account?.address as `0x${string}` | undefined} />
        <ActivityList />
      </aside>

      {/* Gate just-in-time: login + KYC, solo al confirmar un pago */}
      {pending && (
        <PaymentGate
          gate={gate}
          onReady={() => {
            const intent = pending;
            setPending(null);
            void execute(intent);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
