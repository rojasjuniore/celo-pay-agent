import { createPrivateKey } from "node:crypto";
import { SignJWT } from "jose";
import { requireEnv, getEnv } from "@/lib/env";
import { currencyForCountry } from "@/modules/ramp/local-currency";

/**
 * Off-ramp GLOBAL vía Noah (producción). Convierte cripto en moneda local y la
 * paga a una cuenta destino; el corredor lo resuelve Noah por país (120+ monedas).
 *
 * Auth de producción: header X-Api-Key + Api-Signature (JWT ES384 firmado con la
 * clave privada). Flujo confirmado en docs.noah.com:
 *   POST /transactions/sell/prepare  → FormSessionID
 *   POST /transactions/sell          → ejecuta el payout
 *
 * Falla fuerte sin credenciales. No simula payouts.
 */
const DEFAULT_BASE = "https://api.noah.com";

export interface NoahPayoutInput {
  /** Monto en la moneda fiat local (ej. COP). */
  fiatAmount: number;
  /** País destino ISO-3166 alpha-2 (define el corredor). */
  country: string;
  /** Cripto de origen (símbolo Noah). */
  cryptoCurrency: string;
  /** Referencia externa idempotente. */
  externalId: string;
}

export interface NoahPayoutResult {
  transactionId: string;
  status: "Pending" | "Settled" | "Failed";
  fiatCurrency: string;
}

export class NoahOffRampAdapter {
  private base(): string {
    return getEnv().NOAH_API_BASE ?? DEFAULT_BASE;
  }

  /**
   * Firma el cuerpo como JWT ES384 (header Api-Signature).
   * La clave de Noah viene en formato EC SEC1 (`BEGIN EC PRIVATE KEY`);
   * createPrivateKey de Node lo acepta (jose's importPKCS8 no).
   *
   * UNCONFIRMED: la forma exacta del claim que Noah espera (¿hash del body?,
   * ¿aud?, ¿nonce?). Se ajusta al confirmar el contrato con la consulta a la API.
   */
  private async sign(payload: object): Promise<string> {
    const pem = requireEnv("NOAH_SIGNING_PRIVATE_KEY").replace(/\\n/g, "\n");
    const key = createPrivateKey({ key: pem, format: "pem" });
    const audience = getEnv().NOAH_API_BASE ?? DEFAULT_BASE;
    return new SignJWT({ body: payload })
      .setProtectedHeader({ alg: "ES384" })
      .setIssuedAt()
      .setAudience(audience)
      .sign(key);
  }

  private async post<T>(path: string, body: object): Promise<T> {
    const apiKey = requireEnv("NOAH_API_KEY");
    const signature = await this.sign(body);
    const res = await fetch(`${this.base()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
        "Api-Signature": signature,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Noah ${path} failed (${res.status}): ${detail}`);
    }
    return (await res.json()) as T;
  }

  /**
   * Crea el payout: prepare → sell. Devuelve el estado de la transacción.
   *
   * UNCONFIRMED: los nombres exactos de los campos del body (CryptoCurrency,
   * FiatCurrency, FormSessionID, etc.) provienen de la doc parcial de Noah; hay
   * que confirmarlos contra el OpenAPI/contrato real de Noah (npm run check-noah).
   */
  async payout(input: NoahPayoutInput): Promise<NoahPayoutResult> {
    const fiatCurrency = currencyForCountry(input.country);
    // 1) prepare → FormSessionID
    const prepared = await this.post<{ FormSessionID: string }>(
      "/transactions/sell/prepare",
      {
        CryptoCurrency: input.cryptoCurrency,
        FiatCurrency: fiatCurrency,
        FiatAmount: input.fiatAmount,
        CountryCode: input.country.toUpperCase(),
      },
    );
    // 2) sell → ejecuta el payout
    const sold = await this.post<{ TransactionID: string; Status: NoahPayoutResult["status"] }>(
      "/transactions/sell",
      {
        FormSessionID: prepared.FormSessionID,
        ExternalID: input.externalId,
      },
    );
    return {
      transactionId: sold.TransactionID,
      status: sold.Status,
      fiatCurrency,
    };
  }
}
