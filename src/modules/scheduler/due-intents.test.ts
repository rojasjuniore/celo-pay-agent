import { describe, it, expect } from "vitest";
import { selectDueIntents, nextRunAfter, type ScheduledIntent } from "./due-intents";

const NOW = 1_700_000_000_000; // instante fijo (no usamos el reloj real)

function intent(over: Partial<ScheduledIntent>): ScheduledIntent {
  return {
    id: "i1",
    type: "remittance",
    amountUsd: 50,
    recipient: "mamá",
    country: "CO",
    schedule: "biweekly",
    status: "pending",
    nextRunAtMs: NOW,
    ...over,
  };
}

describe("selectDueIntents", () => {
  it("incluye los pendientes ya vencidos", () => {
    const due = selectDueIntents([intent({ nextRunAtMs: NOW - 1000 })], NOW);
    expect(due).toHaveLength(1);
  });

  it("excluye los que aún no vencen", () => {
    const due = selectDueIntents([intent({ nextRunAtMs: NOW + 1000 })], NOW);
    expect(due).toHaveLength(0);
  });

  it("ignora los que no están pending", () => {
    const due = selectDueIntents(
      [intent({ nextRunAtMs: NOW - 1000, status: "done" })],
      NOW,
    );
    expect(due).toHaveLength(0);
  });
});

describe("nextRunAfter", () => {
  it("reprograma a +14 días para biweekly", () => {
    const next = nextRunAfter({ schedule: "biweekly" }, NOW);
    expect(next).toBe(NOW + 14 * 24 * 60 * 60 * 1000);
  });

  it("no reprograma un pago único", () => {
    expect(nextRunAfter({ schedule: "once" }, NOW)).toBeNull();
  });
});
