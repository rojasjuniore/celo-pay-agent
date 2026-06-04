import type { AgentCard } from "@/modules/identity/agent-card";

/**
 * IdentityPort — registro de identidad del agente en ERC-8004.
 * El dominio no sabe de IPFS ni de contratos; el adapter (identity.erc8004.ts)
 * sube el card a IPFS y registra su URI on-chain.
 */
export interface RegisterResult {
  agentId: bigint;
  txHash: `0x${string}`;
  agentURI: string;
}

export interface IdentityPort {
  /** Sube el card a IPFS y lo registra on-chain; devuelve el agentId minteado. */
  register(card: AgentCard): Promise<RegisterResult>;
  /** Devuelve la URI registrada de un agente (lectura on-chain). */
  getAgentURI(agentId: bigint): Promise<string>;
}
