import { describe, it, expect } from "vitest";
import { feeCurrencyFor, isUnconfirmedFeeCurrency } from "./fee-currency";
import { FEE_CURRENCY_USDC, FEE_CURRENCY_USDT } from "@/lib/celo-constants";

describe("feeCurrencyFor", () => {
  it("devuelve el adapter verificado para USDC", () => {
    expect(feeCurrencyFor("USDC")).toBe(FEE_CURRENCY_USDC);
  });

  it("devuelve el adapter (no verificado) para USDT", () => {
    expect(feeCurrencyFor("USDT")).toBe(FEE_CURRENCY_USDT);
  });

  it("no asocia feeCurrency a USDm", () => {
    expect(feeCurrencyFor("USDm")).toBeUndefined();
  });
});

describe("isUnconfirmedFeeCurrency", () => {
  it("marca el adapter USDT como no confirmado", () => {
    expect(isUnconfirmedFeeCurrency(FEE_CURRENCY_USDT)).toBe(true);
  });

  it("considera confirmado el adapter USDC", () => {
    expect(isUnconfirmedFeeCurrency(FEE_CURRENCY_USDC)).toBe(false);
  });

  it("trata undefined (gas en CELO) como confirmado", () => {
    expect(isUnconfirmedFeeCurrency(undefined)).toBe(false);
  });
});
