import { describe, it, expect } from "vitest";
import {
  CELO_CHAIN_ID,
  FEE_CURRENCY_USDC,
  FEE_CURRENCY_USDT,
  USDT,
} from "@/lib/celo-constants";

describe("celo-constants", () => {
  it("expone el chainId de Celo Mainnet", () => {
    expect(CELO_CHAIN_ID).toBe(42220);
  });

  it("las direcciones de feeCurrency (USDC y USDT) son address 0x válidas", () => {
    expect(FEE_CURRENCY_USDC).toMatch(/^0x[0-9a-fA-F]{40}$/);
    expect(FEE_CURRENCY_USDT).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it("el token USDT y su feeCurrency adapter son direcciones DISTINTAS", () => {
    // El adapter (CGP-0167) no es el token: usar el token como fee currency falla.
    expect(FEE_CURRENCY_USDT.toLowerCase()).not.toBe(USDT.toLowerCase());
  });
});
