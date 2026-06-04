import { describe, it, expect } from "vitest";
import { parseIntent } from "./intent";
import { PolicyError } from "./policy";

describe("parseIntent", () => {
  it("extrae una remesa programada desde lenguaje natural", () => {
    const out = parseIntent("manda $50 a mi mamá en Bogotá cada quincena");
    expect(out).toMatchObject({
      type: "remittance",
      amountUsd: 50,
      country: "CO",
      schedule: "biweekly",
    });
    expect(out.recipient.toLowerCase()).toContain("mamá");
  });

  it("interpreta un pago único sin frecuencia como schedule 'once'", () => {
    const out = parseIntent("envía $20 a Carlos en Medellín");
    expect(out.type).toBe("payment");
    expect(out.amountUsd).toBe(20);
    expect(out.schedule).toBe("once");
  });

  it("reconoce frecuencia mensual y la marca como recurring", () => {
    const out = parseIntent("paga $9 a Netflix cada mes");
    expect(out.schedule).toBe("monthly");
    expect(out.type).toBe("recurring");
  });

  it("rechaza montos sobre el límite de policy (fail-loud, sin fallback)", () => {
    expect(() => parseIntent("manda $5000 a un random")).toThrow(PolicyError);
  });

  it("falla fuerte si no encuentra un monto", () => {
    expect(() => parseIntent("hola, cómo estás")).toThrow(/no amount|monto/i);
  });

  // El producto debe funcionar en inglés y español (sin hardcodear un idioma).
  it("entiende una remesa programada en inglés", () => {
    const out = parseIntent("send $50 to my mom in Bogotá every two weeks");
    expect(out).toMatchObject({
      type: "remittance",
      amountUsd: 50,
      country: "CO",
      schedule: "biweekly",
    });
    expect(out.recipient.toLowerCase()).toContain("mom");
  });

  it("reconoce pago recurrente mensual en inglés", () => {
    const out = parseIntent("pay $9 to Netflix monthly");
    expect(out.schedule).toBe("monthly");
    expect(out.type).toBe("recurring");
    expect(out.recipient.toLowerCase()).toContain("netflix");
  });

  it("interpreta un pago único en inglés como 'once'", () => {
    const out = parseIntent("send $20 to Carlos");
    expect(out.type).toBe("payment");
    expect(out.amountUsd).toBe(20);
    expect(out.schedule).toBe("once");
  });
});
