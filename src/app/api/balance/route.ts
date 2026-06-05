import { createPublicClient, http, erc20Abi } from "viem";
import { celo } from "viem/chains";
import { USDT } from "@/lib/celo-constants";
import { getEnv } from "@/lib/env";
import { unitsToUsd } from "@/modules/payments/amounts";
import { walletFromSession } from "@/lib/session";

/**
 * Saldo USDT real de la wallet del USUARIO logueado (lectura onchain en Celo).
 * La wallet sale de la sesión verificada (cookie), no del body → sin IDOR.
 * 401 si no hay sesión. Lectura pública, no necesita la private key del agente.
 */
function readCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function GET(request: Request): Promise<Response> {
  const wallet = await walletFromSession(readCookie(request, "remi_session"));
  if (!wallet) return Response.json({ error: "not signed in" }, { status: 401 });

  const rpc = getEnv().CELO_RPC_URL;
  const client = createPublicClient({ chain: celo, transport: http(rpc) });
  const units = await client.readContract({
    address: USDT,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [wallet],
  });

  return Response.json({
    token: "USDT",
    address: wallet,
    units: units.toString(),
    usd: unitsToUsd(units),
  });
}
