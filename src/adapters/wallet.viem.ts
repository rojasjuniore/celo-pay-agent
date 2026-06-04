import { createWalletClient, createPublicClient, http, erc20Abi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { requireEnv } from "@/lib/env";
import type { WalletPort, TransferParams } from "@/ports/wallet.port";

// Fábricas tipadas por inferencia: evita el conflicto de `ReturnType<...>` con
// genéricos por defecto (chain undefined) frente al cliente real (chain=celo).
function makeClients(rpc: string, account: ReturnType<typeof privateKeyToAccount>) {
  const wallet = createWalletClient({ account, chain: celo, transport: http(rpc) });
  const publicClient = createPublicClient({ chain: celo, transport: http(rpc) });
  return { wallet, publicClient };
}

/**
 * Adapter de WalletPort con viem sobre Celo. Soporta gas gasless (CIP-64):
 * el campo `feeCurrency` hace que el gas se pague en el stablecoin indicado.
 * Falla fuerte si falta AGENT_PRIVATE_KEY.
 */
export class ViemWalletAdapter implements WalletPort {
  private readonly clients: ReturnType<typeof makeClients>;
  private readonly account: ReturnType<typeof privateKeyToAccount>;

  constructor() {
    const raw = requireEnv("AGENT_PRIVATE_KEY").trim();
    const rpc = requireEnv("CELO_RPC_URL");
    // viem exige la private key con prefijo 0x; la aceptamos con o sin él.
    const pk = (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
    this.account = privateKeyToAccount(pk);
    this.clients = makeClients(rpc, this.account);
  }

  address(): `0x${string}` {
    return this.account.address;
  }

  async transferStablecoin({
    token,
    to,
    amount,
    feeCurrency,
  }: TransferParams): Promise<`0x${string}`> {
    return this.clients.wallet.writeContract({
      account: this.account,
      chain: celo,
      address: token,
      abi: erc20Abi,
      functionName: "transfer",
      args: [to, amount],
      // CIP-64: gas pagado en el stablecoin si se especifica.
      ...(feeCurrency ? { feeCurrency } : {}),
    });
  }

  async balanceOf(token: `0x${string}`): Promise<bigint> {
    return this.clients.publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [this.account.address],
    });
  }
}
