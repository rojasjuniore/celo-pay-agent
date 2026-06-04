import { createWalletClient, createPublicClient, http, decodeEventLog } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { requireEnv } from "@/lib/env";
import { IDENTITY_REGISTRY } from "@/lib/celo-constants";
import { identityRegistryAbi } from "@/lib/erc8004-abi";
import type { AgentCard } from "@/modules/identity/agent-card";
import type { IdentityPort, RegisterResult } from "@/ports/identity.port";

const PINATA_PIN_JSON = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

function makeClients(rpc: string, account: ReturnType<typeof privateKeyToAccount>) {
  const wallet = createWalletClient({ account, chain: celo, transport: http(rpc) });
  const publicClient = createPublicClient({ chain: celo, transport: http(rpc) });
  return { wallet, publicClient };
}

/**
 * Adapter de IdentityPort para ERC-8004 vía viem (sin depender de un SDK de
 * terceros no verificado). Sube el agent card a IPFS con Pinata y registra su
 * URI on-chain en el Identity Registry. Falla fuerte sin credenciales.
 */
export class Erc8004IdentityAdapter implements IdentityPort {
  private readonly clients: ReturnType<typeof makeClients>;
  private readonly account: ReturnType<typeof privateKeyToAccount>;

  constructor() {
    const pk = requireEnv("AGENT_PRIVATE_KEY");
    const rpc = requireEnv("CELO_RPC_URL");
    this.account = privateKeyToAccount(pk as `0x${string}`);
    this.clients = makeClients(rpc, this.account);
  }

  /** Sube el card a IPFS vía Pinata; devuelve la URI ipfs://<cid>. */
  private async pinToIpfs(card: AgentCard): Promise<string> {
    const jwt = requireEnv("PINATA_JWT");
    const res = await fetch(PINATA_PIN_JSON, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ pinataContent: card }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Pinata pin failed (${res.status}): ${detail}`);
    }
    const { IpfsHash } = (await res.json()) as { IpfsHash: string };
    return `ipfs://${IpfsHash}`;
  }

  async register(card: AgentCard): Promise<RegisterResult> {
    const agentURI = await this.pinToIpfs(card);
    const txHash = await this.clients.wallet.writeContract({
      account: this.account,
      chain: celo,
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [agentURI],
    });
    const receipt = await this.clients.publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    const agentId = extractAgentId(receipt.logs);
    return { agentId, txHash, agentURI };
  }

  /** Dirección del operador (wallet del agente) que registra. */
  operatorAddress(): `0x${string}` {
    return this.account.address;
  }

  async getAgentURI(agentId: bigint): Promise<string> {
    return this.clients.publicClient.readContract({
      address: IDENTITY_REGISTRY,
      abi: identityRegistryAbi,
      functionName: "tokenURI",
      args: [agentId],
    });
  }
}

/** Extrae el agentId del evento Registered en los logs del receipt. */
function extractAgentId(logs: readonly { data: `0x${string}`; topics: `0x${string}`[] }[]): bigint {
  for (const log of logs) {
    try {
      const decoded = decodeEventLog({
        abi: identityRegistryAbi,
        data: log.data,
        topics: log.topics as [signature: `0x${string}`, ...args: `0x${string}`[]],
      });
      if (decoded.eventName === "Registered") {
        return (decoded.args as { agentId: bigint }).agentId;
      }
    } catch {
      // Log de otro contrato/evento: ignorar y seguir buscando.
    }
  }
  throw new Error("Registered event not found in tx receipt. / No se encontró el evento Registered.");
}
