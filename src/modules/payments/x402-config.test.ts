import { describe, it, expect } from "vitest";
import { buildResourceParams, readPaymentHeader } from "./x402-config";

const payTo = "0x1111111111111111111111111111111111111111" as const;

describe("buildResourceParams", () => {
  it("formatea el precio USD al formato thirdweb $0.01", () => {
    const p = buildResourceParams({
      resourceUrl: "https://x/api/quote",
      payTo,
      priceUsd: 0.01,
      description: "FX quote",
    });
    expect(p.price).toBe("$0.01");
    expect(p.method).toBe("GET");
    expect(p.routeConfig.maxTimeoutSeconds).toBe(3600);
  });

  it("falla fuerte con precio no positivo", () => {
    expect(() =>
      buildResourceParams({ resourceUrl: "https://x", payTo, priceUsd: 0, description: "x" }),
    ).toThrow(/price|precio/i);
  });
});

describe("readPaymentHeader", () => {
  it("lee X-PAYMENT", () => {
    const h = new Headers({ "X-PAYMENT": "abc" });
    expect(readPaymentHeader(h)).toBe("abc");
  });

  it("prefiere PAYMENT-SIGNATURE si está presente", () => {
    const h = new Headers({ "PAYMENT-SIGNATURE": "sig", "X-PAYMENT": "abc" });
    expect(readPaymentHeader(h)).toBe("sig");
  });

  it("devuelve null si no hay header de pago", () => {
    expect(readPaymentHeader(new Headers())).toBeNull();
  });
});
