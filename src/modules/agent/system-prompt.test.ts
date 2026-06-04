import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./system-prompt";
import { POLICY } from "./policy";

describe("buildSystemPrompt", () => {
  it("incluye los límites reales de policy (no hardcodeados aparte)", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain(`$${POLICY.maxPerTxUsd}`);
    expect(prompt).toContain(`$${POLICY.maxPerWeekUsd}`);
  });

  it("es bilingüe (menciona ambos idiomas)", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/English and Spanish|inglés y español/i);
  });

  it("instruye confirmar antes de mover dinero", () => {
    expect(buildSystemPrompt().toLowerCase()).toMatch(/confirm|confirma/);
  });
});
