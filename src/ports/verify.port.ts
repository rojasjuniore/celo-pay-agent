/**
 * VerifyPort — verificación anti-sybil del agente vía Self Agent ID
 * (proof-of-human, extensión ERC-8004). Opcional pero suma en el hackatón.
 */
export interface VerifyStatus {
  verified: boolean;
  /** ID de Self asociado al agente, si existe. */
  selfId?: string;
}

export interface VerifyPort {
  /** Consulta si el agente tiene una verificación Self asociada. */
  status(agentAddress: `0x${string}`): Promise<VerifyStatus>;
}
