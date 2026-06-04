/**
 * Registra el agente en ERC-8004 (Celo Mainnet) y muestra el agentId + link a
 * 8004scan. Ejecutar: `npx tsx scripts/register-agent.ts` con AGENT_PRIVATE_KEY,
 * CELO_RPC_URL y PINATA_JWT en el entorno.
 */
import { Erc8004IdentityAdapter } from "@/adapters/identity.erc8004";
import { buildAgentCard } from "@/modules/identity/agent-card";

async function main() {
  const adapter = new Erc8004IdentityAdapter();
  const card = buildAgentCard({
    name: "celo-pay-agent",
    description:
      "Chat agent for gasless USDT payments & remittances to Colombia (USDT → COP). / Agente de pagos y remesas USDT → COP gasless en Celo.",
    url: process.env.AGENT_PUBLIC_URL ?? "https://celo-pay-agent.vercel.app",
    operator: adapter.operatorAddress(),
  });

  console.log("Subiendo agent card a IPFS y registrando on-chain…");
  const { agentId, txHash, agentURI } = await adapter.register(card);

  console.log("\n✅ Agente registrado en ERC-8004");
  console.log(`   agentId:  ${agentId}`);
  console.log(`   tx:       https://celoscan.io/tx/${txHash}`);
  console.log(`   agentURI: ${agentURI}`);
  console.log(`   8004scan: https://8004scan.io/agents/celo/${agentId}`);
}

main().catch((err) => {
  console.error("❌ Registro falló:", err);
  process.exit(1);
});
