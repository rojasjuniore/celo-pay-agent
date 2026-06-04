"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Counter } from "./Counter";
import { celoscanTx, shortHash } from "@/components/chat/explorer";

interface Balance {
  usd: number;
  address: `0x${string}`;
}
interface ActivityItem {
  kind: string;
  chain: string;
  txHash: string;
  status: string;
}

/** Tarjeta de saldo: lee el balance real onchain y lo anima. */
export function BalanceCard() {
  const [bal, setBal] = useState<Balance | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/balance")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: Balance) => setBal(d))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="p-6 rounded-2xl" style={{ background: "var(--cb-surface-dark)", color: "var(--cb-on-dark)" }}>
      <p className="text-sm mb-2" style={{ color: "var(--cb-on-dark-soft)" }}>Agent balance · USDT on Celo</p>
      {bal ? (
        <p className="text-4xl font-mono font-medium">
          <Counter value={bal.usd} prefix="$" />
        </p>
      ) : error ? (
        <p className="text-sm" style={{ color: "var(--cb-on-dark-soft)" }}>Connect a funded wallet to see balance</p>
      ) : (
        <div className="h-10 w-40 rounded animate-pulse" style={{ background: "var(--cb-surface-dark-elevated)" }} />
      )}
      {bal && (
        <p className="text-xs font-mono mt-2" style={{ color: "var(--cb-on-dark-soft)" }}>{shortHash(bal.address)}</p>
      )}
    </div>
  );
}

/** Depósito: muestra la dirección del agente + QR para enviar USDT en Celo. */
export function DepositCard({ address }: { address?: `0x${string}` }) {
  const [copied, setCopied] = useState(false);
  if (!address) {
    return (
      <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--cb-hairline)" }}>
        <p className="text-sm" style={{ color: "var(--cb-muted)" }}>Sign in to get your deposit address.</p>
      </div>
    );
  }
  return (
    <div className="p-6 rounded-2xl border flex flex-col items-center gap-3" style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}>
      <p className="text-sm font-semibold" style={{ color: "var(--cb-ink)" }}>Deposit USDT (Celo)</p>
      <div className="p-3 rounded-xl" style={{ background: "#fff" }}>
        <QRCodeSVG value={address} size={148} />
      </div>
      <button
        onClick={() => {
          navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="text-xs font-mono px-3 py-1 rounded-full"
        style={{ background: "var(--cb-surface-strong)", color: "var(--cb-ink)" }}
      >
        {copied ? "Copied" : shortHash(address)}
      </button>
      <p className="text-xs text-center" style={{ color: "var(--cb-muted)" }}>
        Only send USDT on Celo to this address.
      </p>
    </div>
  );
}

/** Historial: últimas tx onchain reales desde el log. */
export function ActivityList() {
  const [items, setItems] = useState<ActivityItem[] | null>(null);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { items: ActivityItem[] }) => setItems(d.items))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="p-6 rounded-2xl border" style={{ borderColor: "var(--cb-hairline)", background: "var(--cb-canvas)" }}>
      <p className="text-sm font-semibold mb-4" style={{ color: "var(--cb-ink)" }}>Recent activity</p>
      {!items ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-8 rounded animate-pulse" style={{ background: "var(--cb-surface-strong)" }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--cb-muted)" }}>No transactions yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span style={{ color: "var(--cb-ink)" }}>{it.kind}</span>
              <a href={celoscanTx(it.txHash)} target="_blank" rel="noreferrer" className="font-mono text-xs" style={{ color: "var(--cb-primary)" }}>
                {shortHash(it.txHash)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
