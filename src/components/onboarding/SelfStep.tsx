"use client";

import { useMemo } from "react";
import { SelfQRcodeWrapper, SelfAppBuilder } from "@selfxyz/qrcode";

/**
 * Paso de verificación con Self (ZK passport). Muestra el QR real: el usuario
 * lo escanea con la app Self, escanea su pasaporte y genera el proof. Al éxito
 * llama onVerified. El endpoint backend (/api/self/verify) valida el proof.
 */
export function SelfStep({
  userId,
  endpoint,
  scope,
  onVerified,
}: {
  userId: string;
  endpoint: string;
  scope: string;
  onVerified: () => void;
}) {
  const selfApp = useMemo(() => {
    return new SelfAppBuilder({
      appName: "Remi",
      scope,
      endpoint,
      endpointType: "https",
      userId,
      userIdType: "hex",
      disclosures: { minimumAge: 18, nationality: true },
    }).build();
  }, [userId, endpoint, scope]);

  return (
    <div className="flex flex-col items-center text-center gap-5">
      <h2 className="text-2xl font-medium" style={{ color: "var(--cb-ink)" }}>
        Verify your identity
      </h2>
      <p className="max-w-sm" style={{ color: "var(--cb-body)" }}>
        Scan with the <strong>Self app</strong> to prove you&apos;re a real human
        with a zero-knowledge passport proof. Your data never leaves your phone.
      </p>
      <div className="p-4 rounded-2xl" style={{ background: "var(--cb-surface-strong)" }}>
        <SelfQRcodeWrapper
          selfApp={selfApp}
          onSuccess={onVerified}
          onError={() => {}}
        />
      </div>
      <p className="text-xs" style={{ color: "var(--cb-muted)" }}>
        Powered by Self Protocol · sybil-resistant proof-of-human
      </p>
    </div>
  );
}
