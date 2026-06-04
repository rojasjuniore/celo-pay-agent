/** Enlaces a exploradores de Celo. Centralizado para no repetir URLs. */
export function celoscanTx(hash: string): string {
  return `https://celoscan.io/tx/${hash}`;
}

export function scan8004(agentId: string): string {
  return `https://8004scan.io/agents/celo/${agentId}`;
}

/** Acorta un hash 0xabc…def para mostrar. */
export function shortHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : hash;
}
