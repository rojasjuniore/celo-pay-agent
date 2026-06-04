/**
 * Agent Card — el JSON de registro del agente para ERC-8004.
 * Builder puro (sin red): describe identidad, endpoints y skills del agente.
 * Se sube a IPFS y su URI se registra on-chain en el Identity Registry.
 */

export interface AgentCardInput {
  name: string;
  description: string;
  /** URL base pública del agente (su API de chat). */
  url: string;
  /** Dirección de la wallet del agente (operador). */
  operator: `0x${string}`;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
}

export interface AgentCard {
  /** Versión del esquema de agent card que seguimos. */
  schemaVersion: "erc-8004/v1";
  name: string;
  description: string;
  url: string;
  operator: `0x${string}`;
  skills: AgentSkill[];
}

/** Skills declaradas del agente de pagos (bilingüe ES/EN en la descripción). */
const PAYMENT_SKILLS: AgentSkill[] = [
  {
    id: "send-payment",
    name: "Send stablecoin payment",
    description: "Envía pagos en stablecoin (USDT) gasless en Celo. / Sends gasless USDT payments on Celo.",
  },
  {
    id: "remittance-co",
    name: "Remittance to Colombia",
    description: "Remesas USDT → COP vía bridge y off-ramp. / USDT → COP remittances via bridge and off-ramp.",
  },
  {
    id: "scheduled-payment",
    name: "Scheduled & recurring payments",
    description: "Pagos programados y recurrentes autónomos. / Autonomous scheduled and recurring payments.",
  },
];

/** Construye el agent card a partir de los datos del agente. */
export function buildAgentCard(input: AgentCardInput): AgentCard {
  if (!input.name.trim()) {
    throw new Error("Agent name is required. / El nombre del agente es obligatorio.");
  }
  if (!/^https?:\/\//.test(input.url)) {
    throw new Error("Agent url must be an absolute URL. / La url del agente debe ser absoluta.");
  }
  return {
    schemaVersion: "erc-8004/v1",
    name: input.name,
    description: input.description,
    url: input.url,
    operator: input.operator,
    skills: PAYMENT_SKILLS,
  };
}
