import { ViemWalletAdapter } from "@/adapters/wallet.viem";
import { USDT } from "@/lib/celo-constants";
import { unitsToUsd } from "@/modules/payments/amounts";

/**
 * Saldo USDT real de la wallet del agente en Celo (lectura onchain). Falla
 * fuerte sin AGENT_PRIVATE_KEY/RPC. Sin datos inventados.
 */
export async function GET(): Promise<Response> {
  const wallet = new ViemWalletAdapter();
  const units = await wallet.balanceOf(USDT);
  return Response.json({
    token: "USDT",
    address: wallet.address(),
    units: units.toString(),
    usd: unitsToUsd(units),
  });
}
