"use client";

import { ConnectButton } from "thirdweb/react";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { celo } from "thirdweb/chains";
import { getThirdwebClient } from "@/lib/thirdweb-client";

/**
 * Login de Remi vía thirdweb: email/social → wallet embebida, o conectar una
 * wallet externa (MetaMask, Valora). La wallet es la identidad del usuario.
 * Opera en Celo.
 */
const wallets = [
  inAppWallet({ auth: { options: ["email", "google", "passkey"] } }),
  createWallet("io.metamask"),
  createWallet("com.valoraapp"),
];

export function LoginButton({ label = "Get started" }: { label?: string }) {
  return (
    <ConnectButton
      client={getThirdwebClient()}
      wallets={wallets}
      chain={celo}
      connectButton={{ label }}
      connectModal={{ title: "Sign in to Remi", size: "compact" }}
    />
  );
}
