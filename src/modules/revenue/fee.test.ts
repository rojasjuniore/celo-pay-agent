import { describe, it, expect } from "vitest";
import { computeFee, getFeeBps, DEFAULT_FEE_BPS } from "./fee";

describe("computeFee", () => {
  it("aplica 0.5% (50 bps) a 1 USDT (6 decimales)", () => {
    // 1 USDT = 1_000_000; 0.5% = 5_000
    const { fee, net } = computeFee(1_000_000n, 50);
    expect(fee).toBe(5_000n);
    expect(net).toBe(995_000n);
  });

  it("fee 0 con 0 bps", () => {
    expect(computeFee(1_000_000n, 0).fee).toBe(0n);
  });

  it("fee + net siempre suman el total", () => {
    const { fee, net } = computeFee(123_456_789n, 50);
    expect(fee + net).toBe(123_456_789n);
  });

  it("falla fuerte con monto no positivo", () => {
    expect(() => computeFee(0n, 50)).toThrow(/amount|monto/i);
  });
});

describe("getFeeBps", () => {
  it("usa el default 0.5% si no está configurado", () => {
    expect(getFeeBps({})).toBe(DEFAULT_FEE_BPS);
  });

  it("lee el valor del entorno", () => {
    expect(getFeeBps({ REVENUE_FEE_BPS: "100" })).toBe(100);
  });

  it("falla fuerte con bps fuera de rango (>10%)", () => {
    expect(() => getFeeBps({ REVENUE_FEE_BPS: "2000" })).toThrow(/REVENUE_FEE_BPS/);
  });
});
