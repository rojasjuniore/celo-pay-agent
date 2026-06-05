"use client";

import { useEffect, useRef } from "react";
import type { Account } from "thirdweb/wallets";
import { buildReadMessage } from "@/modules/payments/read-auth";

/** Instante actual fuera del render/effect (evita la regla de pureza de React). */
function nowMs(): number {
  return Date.now();
}

/**
 * Al conectar la wallet, firma un mensaje de sesión y lo canjea por una cookie
 * httpOnly en /api/session. A partir de ahí el server conoce la identidad sin
 * confiar en el cliente. Firma una sola vez por wallet conectada.
 */
export function useSessionLogin(account: Account | undefined) {
  const signedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!account || signedFor.current === account.address) return;
    signedFor.current = account.address;
    const wallet = account.address as `0x${string}`;
    const issuedAtMs = nowMs();
    account
      .signMessage({ message: buildReadMessage(wallet, issuedAtMs) })
      .then((signature) =>
        fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet, issuedAtMs, signature }),
        }),
      )
      .catch(() => {
        // Si falla, se reintenta al reconectar (no bloquea el chat en guest).
        signedFor.current = null;
      });
  }, [account]);
}
