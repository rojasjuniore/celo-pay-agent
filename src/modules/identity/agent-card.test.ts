import { describe, it, expect } from "vitest";
import { buildAgentCard } from "./agent-card";

const base = {
  name: "celo-pay-agent",
  description: "Pagos gasless en Celo",
  url: "https://celo-pay-agent.vercel.app",
  operator: "0x1111111111111111111111111111111111111111" as const,
};

describe("buildAgentCard", () => {
  it("construye un card con esquema erc-8004/v1 y las skills de pagos", () => {
    const card = buildAgentCard(base);
    expect(card.schemaVersion).toBe("erc-8004/v1");
    expect(card.operator).toBe(base.operator);
    expect(card.skills.map((s) => s.id)).toContain("send-payment");
    expect(card.skills.length).toBeGreaterThanOrEqual(3);
  });

  it("incluye descripciones bilingües (ES/EN) en las skills", () => {
    const card = buildAgentCard(base);
    expect(card.skills.every((s) => s.description.includes("/"))).toBe(true);
  });

  it("falla fuerte si el nombre está vacío", () => {
    expect(() => buildAgentCard({ ...base, name: "  " })).toThrow(/name|nombre/i);
  });

  it("falla fuerte si la url no es absoluta", () => {
    expect(() => buildAgentCard({ ...base, url: "/relativo" })).toThrow(/url/i);
  });
});
