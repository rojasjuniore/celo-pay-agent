import { describe, it, expect } from "vitest";
import { getEnv, requireEnv } from "@/lib/env";

describe("getEnv", () => {
  it("aplica el default de CELO_RPC_URL cuando no está presente", () => {
    const env = getEnv({});
    expect(env.CELO_RPC_URL).toBe("https://forno.celo.org");
  });

  it("respeta el CELO_RPC_URL provisto", () => {
    const env = getEnv({ CELO_RPC_URL: "https://celo-sepolia.example.org" });
    expect(env.CELO_RPC_URL).toBe("https://celo-sepolia.example.org");
  });

  it("deja las vars opcionales como undefined cuando faltan", () => {
    const env = getEnv({});
    expect(env.OPENROUTER_API_KEY).toBeUndefined();
    expect(env.DATABASE_URL).toBeUndefined();
  });
});

describe("requireEnv", () => {
  it("lanza error cuando la var requerida falta", () => {
    expect(() => requireEnv("OPENROUTER_API_KEY", {})).toThrow(
      /Missing required env var OPENROUTER_API_KEY/,
    );
  });

  it("lanza error cuando la var requerida está vacía", () => {
    expect(() => requireEnv("PINATA_JWT", { PINATA_JWT: "" })).toThrow(
      /Falta la variable de entorno requerida PINATA_JWT/,
    );
  });

  it("devuelve el valor cuando la var requerida existe", () => {
    const value = requireEnv("AGENT_PRIVATE_KEY", {
      AGENT_PRIVATE_KEY: "0xabc",
    });
    expect(value).toBe("0xabc");
  });
});
