import { describe, it, expect } from "vitest";
import { usdToUnits, unitsToUsd } from "./amounts";

describe("usdToUnits", () => {
  it("convierte $50 a 50_000_000 (6 decimales)", () => {
    expect(usdToUnits(50)).toBe(50_000_000n);
  });

  it("trunca/redondea a 6 decimales", () => {
    expect(usdToUnits(0.01)).toBe(10_000n);
    expect(usdToUnits(49.75)).toBe(49_750_000n);
  });

  it("falla fuerte con monto no positivo", () => {
    expect(() => usdToUnits(0)).toThrow(/positive|positivo/i);
    expect(() => usdToUnits(-5)).toThrow();
  });
});

describe("unitsToUsd", () => {
  it("es la inversa de usdToUnits", () => {
    expect(unitsToUsd(usdToUnits(50))).toBe(50);
    expect(unitsToUsd(49_750_000n)).toBe(49.75);
  });
});
