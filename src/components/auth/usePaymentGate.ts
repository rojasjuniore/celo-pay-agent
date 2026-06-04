"use client";

import { useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

/**
 * Estado del gate just-in-time para ejecutar un pago: ¿hay login? ¿hay KYC?
 * Se consulta solo cuando el usuario va a confirmar (no bloquea el chat).
 */
export interface PaymentGateState {
  /** Dirección logueada, o undefined si es guest. */
  address?: `0x${string}`;
  /** KYC verificado (Self) para esa wallet. */
  kycVerified: boolean;
  /** Listo para ejecutar: login + KYC. */
  ready: boolean;
  /** Qué falta: "login" | "kyc" | null. */
  missing: "login" | "kyc" | null;
}

export function usePaymentGate(): PaymentGateState {
  const account = useActiveAccount();
  const [kycVerified, setKycVerified] = useState(false);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    const check = () =>
      fetch(`/api/account/${account.address}`)
        .then((r) => r.json())
        .then((d: { kycVerified: boolean }) => {
          if (!cancelled) setKycVerified(!!d.kycVerified);
        })
        .catch(() => {});
    check();
    // Re-consulta mientras no esté verificado (capta el KYC recién completado).
    const id = setInterval(() => {
      if (!cancelled && !kycVerified) check();
    }, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [account, kycVerified]);

  const address = account?.address as `0x${string}` | undefined;
  // Sin cuenta, el KYC no aplica (evita estado stale tras logout).
  const verified = !!address && kycVerified;
  const ready = !!address && verified;
  const missing = !address ? "login" : !verified ? "kyc" : null;
  return { address, kycVerified: verified, ready, missing };
}
