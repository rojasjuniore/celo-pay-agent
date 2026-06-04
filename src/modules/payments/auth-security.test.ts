import { describe, it, expect } from "vitest";
import { buildAuthMessage, isFresh, SIGNATURE_TTL_MS } from "./auth-message";
import { assertSpendAllowed, SpendLimitError } from "./spend-limit";
import { POLICY } from "@/modules/agent/policy";
import type { PaymentIntent } from "@/modules/agent/payment-intent";

const intent: PaymentIntent = {
  type: "remittance",
  amountUsd: 50,
  recipient: "mom",
  country: "CO",
  schedule: "once",
};
const NOW = 1_700_000_000_000;

describe("buildAuthMessage", () => {
  it("es determinista e incluye monto, destino, instante y nonce", () => {
    const m = buildAuthMessage(intent, NOW, "nonce-1");
    expect(m).toBe(buildAuthMessage(intent, NOW, "nonce-1"));
    expect(m).toContain("$50");
    expect(m).toContain("mom");
    expect(m).toContain(String(NOW));
    expect(m).toContain("nonce-1");
  });

  it("cambia si cambia el nonce (firmas no intercambiables)", () => {
    expect(buildAuthMessage(intent, NOW, "a")).not.toBe(buildAuthMessage(intent, NOW, "b"));
  });
});

describe("isFresh (anti-replay)", () => {
  it("acepta dentro de la ventana", () => {
    expect(isFresh(NOW, NOW + 1000)).toBe(true);
    expect(isFresh(NOW, NOW + SIGNATURE_TTL_MS)).toBe(true);
  });
  it("rechaza firmas viejas o del futuro", () => {
    expect(isFresh(NOW, NOW + SIGNATURE_TTL_MS + 1)).toBe(false);
    expect(isFresh(NOW, NOW - 1)).toBe(false);
  });
});

describe("assertSpendAllowed", () => {
  it("permite dentro de límites", () => {
    expect(() => assertSpendAllowed(50, 0)).not.toThrow();
  });
  it("rechaza si excede el cap por tx", () => {
    expect(() => assertSpendAllowed(POLICY.maxPerTxUsd + 1, 0)).toThrow(SpendLimitError);
  });
  it("rechaza si el acumulado semanal se pasa", () => {
    expect(() => assertSpendAllowed(50, POLICY.maxPerWeekUsd)).toThrow(SpendLimitError);
  });
});
