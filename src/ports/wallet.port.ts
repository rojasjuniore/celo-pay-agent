/**
 * WalletPort — abstracción de la wallet del agente (server-side).
 * El dominio depende de esta interfaz, no de viem. El adapter concreto
 * (wallet.viem.ts) hace el I/O onchain.
 */
export interface TransferParams {
  /** Token ERC-20 a transferir (dirección). */
  token: `0x${string}`;
  /** Destinatario. */
  to: `0x${string}`;
  /** Monto en la unidad mínima del token (wei del token). */
  amount: bigint;
  /**
   * feeCurrency adapter para pagar el gas en stablecoin (gasless CIP-64).
   * Si se omite, el gas se paga en CELO.
   */
  feeCurrency?: `0x${string}`;
}

export interface WalletPort {
  /** Dirección de la wallet del agente. */
  address(): `0x${string}`;
  /** Transfiere un stablecoin ERC-20; devuelve el hash de la tx. */
  transferStablecoin(params: TransferParams): Promise<`0x${string}`>;
  /** Saldo de un token ERC-20 de la wallet del agente. */
  balanceOf(token: `0x${string}`): Promise<bigint>;
}
