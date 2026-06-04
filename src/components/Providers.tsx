"use client";

import { ThirdwebProvider } from "thirdweb/react";

/** Envuelve la app con el provider de thirdweb (login + wallet). */
export function Providers({ children }: { children: React.ReactNode }) {
  return <ThirdwebProvider>{children}</ThirdwebProvider>;
}
