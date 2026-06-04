"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveAccount } from "thirdweb/react";
import { LoginButton } from "./LoginButton";

/**
 * Guard del dashboard. Decide el flujo:
 *   sin login        → muestra el login (no entra)
 *   login sin KYC    → redirige a /onboarding (KYC obligatorio)
 *   login + KYC      → renderiza children (el dashboard)
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const account = useActiveAccount();
  const router = useRouter();
  // null = aún consultando; true/false = resultado del check de KYC.
  const [kycOk, setKycOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!account) return;
    let cancelled = false;
    fetch(`/api/account/${account.address}`)
      .then((r) => r.json())
      .then((data: { kycVerified: boolean }) => {
        if (cancelled) return;
        setKycOk(data.kycVerified);
        if (!data.kycVerified) router.push("/onboarding");
      })
      .catch(() => {
        if (!cancelled) {
          setKycOk(false);
          router.push("/onboarding");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [account, router]);

  if (!account) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--cb-canvas)" }}>
        <h1 className="text-2xl font-medium" style={{ color: "var(--cb-ink)" }}>Sign in to Remi</h1>
        <LoginButton label="Sign in" />
      </div>
    );
  }

  if (kycOk !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--cb-canvas)" }}>
        <p style={{ color: "var(--cb-muted)" }}>Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
