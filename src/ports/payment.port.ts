/**
 * PaymentPort — pagos entre agentes vía x402. El servidor cobra por un recurso
 * (settle); el cliente paga al consumir un recurso x402 (payFor).
 */
export interface SettleResult {
  /** 200 si el pago se liquidó; 402 si se requiere pago. */
  status: number;
  /** Recibo del facilitator cuando status === 200. */
  paymentReceipt?: unknown;
  /** Cuerpo de error con requisitos de pago cuando status === 402. */
  responseBody?: unknown;
  responseHeaders: Record<string, string>;
}

export interface SettleRequest {
  resourceUrl: string;
  method: "GET" | "POST";
  paymentData: string | null;
  priceUsd: number;
  description: string;
}

export interface PaymentPort {
  /** Lado servidor: verifica y liquida el pago por un recurso. */
  settle(req: SettleRequest): Promise<SettleResult>;
  /** Lado cliente: hace fetch pagando automáticamente un recurso 402. */
  payFor(url: string, init?: RequestInit): Promise<Response>;
}
