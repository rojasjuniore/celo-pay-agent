import { describe, it, expect } from "vitest";
import { deriveCategory, normalizeCategory } from "./category";
import {
  spendingSummary,
  byCategory,
  byRecipient,
  inPeriod,
  type PaymentRecord,
} from "./summary";
import { toCsv } from "./csv";

const NOW = 1_700_000_000_000;
const rec = (over: Partial<PaymentRecord>): PaymentRecord => ({
  amountUsd: 50,
  recipient: "mom",
  country: "CO",
  category: "remittance",
  createdAtMs: NOW,
  ...over,
});

describe("deriveCategory", () => {
  it("detecta suscripción por el nombre", () => {
    expect(deriveCategory({ type: "payment", recipient: "Netflix" })).toBe("subscription");
  });
  it("detecta familia", () => {
    expect(deriveCategory({ type: "payment", recipient: "mi mamá" })).toBe("family");
  });
  it("remittance por type cuando no hay otra señal", () => {
    expect(deriveCategory({ type: "remittance", recipient: "Acme Corp" })).toBe("remittance");
  });
});

describe("normalizeCategory", () => {
  it("acepta una categoría válida", () => {
    expect(normalizeCategory("business")).toBe("business");
  });
  it("cae en other si es inválida", () => {
    expect(normalizeCategory("xyz")).toBe("other");
    expect(normalizeCategory(null)).toBe("other");
  });
});

describe("spendingSummary", () => {
  it("suma total, cuenta, fee 0.5% y top destinatario", () => {
    const records = [rec({ amountUsd: 100, recipient: "mom" }), rec({ amountUsd: 50, recipient: "dad" })];
    const s = spendingSummary(records, 50);
    expect(s.totalUsd).toBe(150);
    expect(s.count).toBe(2);
    expect(s.feesUsd).toBeCloseTo(0.75, 2); // 0.5% de 150
    expect(s.topRecipient).toEqual({ recipient: "mom", totalUsd: 100 });
  });
});

describe("byCategory / byRecipient", () => {
  it("agrupa por categoría ordenado", () => {
    const records = [
      rec({ amountUsd: 30, category: "subscription" }),
      rec({ amountUsd: 70, category: "family" }),
    ];
    expect(byCategory(records)[0]).toEqual({ category: "family", totalUsd: 70 });
  });
  it("agrupa por destinatario", () => {
    const records = [rec({ amountUsd: 20, recipient: "a" }), rec({ amountUsd: 20, recipient: "a" })];
    expect(byRecipient(records)).toEqual([{ recipient: "a", totalUsd: 40 }]);
  });
});

describe("inPeriod", () => {
  it("filtra por rango de fechas", () => {
    const records = [rec({ createdAtMs: NOW - 5000 }), rec({ createdAtMs: NOW + 5000 })];
    expect(inPeriod(records, NOW, NOW + 10000)).toHaveLength(1);
  });
});

describe("toCsv", () => {
  it("genera CSV con cabecera y escapa comas", () => {
    const csv = toCsv([rec({ amountUsd: 50, recipient: "Acme, Inc" })]);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("date,amount_usd,recipient,country,category");
    expect(lines[1]).toContain('"Acme, Inc"');
    expect(lines[1]).toContain("50.00");
  });
});
