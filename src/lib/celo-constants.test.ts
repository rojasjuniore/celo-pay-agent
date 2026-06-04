import { describe, it, expect } from "vitest";
import {
  assertFeeCurrencyConfirmed,
  CELO_CHAIN_ID,
  FEE_CURRENCY_USDC,
} from "@/lib/celo-constants";

describe("celo-constants", () => {
  it("expone el chainId de Celo Mainnet", () => {
    expect(CELO_CHAIN_ID).toBe(42220);
  });

  it("la dirección verificada de USDC es un address 0x", () => {
    expect(FEE_CURRENCY_USDC).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });
});

describe("assertFeeCurrencyConfirmed", () => {
  it("lanza error si el flag no está en 'true'", () => {
    expect(() => assertFeeCurrencyConfirmed({})).toThrow(/UNCONFIRMED/);
  });

  it("lanza error si el flag tiene otro valor", () => {
    expect(() =>
      assertFeeCurrencyConfirmed({ FEECURRENCY_USDT_CONFIRMED: "1" }),
    ).toThrow(/SIN CONFIRMAR/);
  });

  it("no lanza cuando el flag es exactamente 'true'", () => {
    expect(() =>
      assertFeeCurrencyConfirmed({ FEECURRENCY_USDT_CONFIRMED: "true" }),
    ).not.toThrow();
  });
});
