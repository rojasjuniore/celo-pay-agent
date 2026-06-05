import { describe, it, expect } from "vitest";
import { buildReadMessage, isReadFresh, READ_TTL_MS } from "./read-auth";

const W = "0xAbC0000000000000000000000000000000000001" as const;
const NOW = 1_700_000_000_000;

describe("buildReadMessage", () => {
  it("liga la firma a la wallet (minúsculas) y al instante", () => {
    const m = buildReadMessage(W, NOW);
    expect(m).toContain(W.toLowerCase());
    expect(m).toContain(String(NOW));
    expect(m).toBe(buildReadMessage(W, NOW)); // determinista
  });
});

describe("isReadFresh", () => {
  it("acepta dentro de la ventana", () => {
    expect(isReadFresh(NOW, NOW + 1000)).toBe(true);
    expect(isReadFresh(NOW, NOW + READ_TTL_MS)).toBe(true);
  });
  it("rechaza vieja o del futuro", () => {
    expect(isReadFresh(NOW, NOW + READ_TTL_MS + 1)).toBe(false);
    expect(isReadFresh(NOW, NOW - 1)).toBe(false);
  });
});
