import { describe, it, expect } from "vitest";
import { feeCurrencyFor } from "./fee-currency";
import { FEE_CURRENCY_USDC, FEE_CURRENCY_USDT } from "@/lib/celo-constants";

describe("feeCurrencyFor", () => {
  it("devuelve el adapter verificado para USDC", () => {
    expect(feeCurrencyFor("USDC")).toBe(FEE_CURRENCY_USDC);
  });

  it("devuelve el adapter verificado para USDT (CGP-0167)", () => {
    expect(feeCurrencyFor("USDT")).toBe(FEE_CURRENCY_USDT);
  });

  it("no asocia feeCurrency a USDm", () => {
    expect(feeCurrencyFor("USDm")).toBeUndefined();
  });
});
