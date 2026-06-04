import { describe, it, expect } from "vitest";
import { buildExecutionPlan } from "./execution-plan";
import type { PaymentIntent } from "./payment-intent";

const coIntent: PaymentIntent = {
  type: "remittance",
  amountUsd: 50,
  recipient: "mamá",
  country: "CO",
  schedule: "biweekly",
};

describe("buildExecutionPlan", () => {
  it("calcula fee 0.5% y neto sobre el monto", () => {
    const plan = buildExecutionPlan(coIntent, 50);
    expect(plan.feeUsd).toBeCloseTo(0.25, 6);
    expect(plan.netUsd).toBeCloseTo(49.75, 6);
  });

  it("incluye transfer a Noah y off-ramp (USDT directo en Celo, sin swap)", () => {
    const keys = buildExecutionPlan(coIntent, 50).steps.map((s) => s.key);
    expect(keys).toEqual(["fee", "quote", "transfer", "offramp"]);
  });

  it("respeta bps configurable", () => {
    expect(buildExecutionPlan(coIntent, 100).feeUsd).toBeCloseTo(0.5, 6);
  });
});
