"use client";

import { createThirdwebClient } from "thirdweb";

/**
 * Cliente thirdweb para el frontend (login). Usa el CLIENT_ID público
 * (NEXT_PUBLIC_THIRDWEB_CLIENT_ID), nunca el secret. Lazy: no rompe el import
 * (ni el prerender) si la env var no está en build; falla al usarse sin ella.
 */
let cached: ReturnType<typeof createThirdwebClient> | undefined;

export function getThirdwebClient() {
  if (cached) return cached;
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "Missing NEXT_PUBLIC_THIRDWEB_CLIENT_ID. / Falta el client id público de thirdweb.",
    );
  }
  cached = createThirdwebClient({ clientId });
  return cached;
}
