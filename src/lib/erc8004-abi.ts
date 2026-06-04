/**
 * ABI mínimo del ERC-8004 Identity Registry (de erc-8004/erc-8004-contracts/abis).
 * Solo las piezas que usamos: register(agentURI), lectura de URI, y el evento
 * Registered para extraer el agentId minteado.
 */
export const identityRegistryAbi = [
  {
    type: "function",
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    // El registry es un ERC-721; la URI del agente se lee con tokenURI.
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "event",
    name: "Registered",
    inputs: [
      { name: "agentId", type: "uint256", indexed: true },
      { name: "agentURI", type: "string", indexed: false },
      { name: "owner", type: "address", indexed: true },
    ],
  },
] as const;
