import { describe, it, expect } from "vitest";
import { canAdvance, nextStep, progress, type OnboardingState } from "./steps";

const base: OnboardingState = { step: "account", selfVerified: false };

describe("canAdvance", () => {
  it("account requiere email válido", () => {
    expect(canAdvance({ ...base, email: "no-email" })).toBe(false);
    expect(canAdvance({ ...base, email: "a@b.co" })).toBe(true);
  });

  it("profile requiere nombre y país ISO-2", () => {
    const s: OnboardingState = { ...base, step: "profile", fullName: "Ana", country: "CO" };
    expect(canAdvance(s)).toBe(true);
    expect(canAdvance({ ...s, country: "Colombia" })).toBe(false);
  });

  it("verify requiere Self verificado", () => {
    expect(canAdvance({ ...base, step: "verify", selfVerified: false })).toBe(false);
    expect(canAdvance({ ...base, step: "verify", selfVerified: true })).toBe(true);
  });
});

describe("progress", () => {
  it("va de 0 a 1 por los pasos", () => {
    expect(progress("account")).toBe(0);
    expect(progress("done")).toBe(1);
  });
});

describe("nextStep", () => {
  it("avanza solo si el paso está completo", () => {
    expect(nextStep({ ...base, email: "a@b.co" })).toBe("profile");
    expect(nextStep({ ...base, email: "bad" })).toBe("account");
  });
});
