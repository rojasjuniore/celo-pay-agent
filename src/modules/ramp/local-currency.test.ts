import { describe, it, expect } from "vitest";
import { currencyForCountry, isCountrySupported } from "./local-currency";

describe("currencyForCountry", () => {
  it("CO → COP (caso de demo)", () => {
    expect(currencyForCountry("CO")).toBe("COP");
  });

  it("es global: MX → MXN, BR → BRL", () => {
    expect(currencyForCountry("MX")).toBe("MXN");
    expect(currencyForCountry("br")).toBe("BRL"); // case-insensitive
  });

  it("falla fuerte con país no soportado", () => {
    expect(() => currencyForCountry("ZZ")).toThrow(/unsupported|no soportado/i);
  });
});

describe("isCountrySupported", () => {
  it("reconoce países con corredor", () => {
    expect(isCountrySupported("CO")).toBe(true);
    expect(isCountrySupported("ZZ")).toBe(false);
  });
});
