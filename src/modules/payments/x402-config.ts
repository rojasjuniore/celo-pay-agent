/**
 * Construcción pura de la config de un recurso x402 (sin red ni thirdweb).
 * Aísla las decisiones de precio/ruta para poder testearlas.
 */

export interface X402RouteConfig {
  description: string;
  mimeType: string;
  maxTimeoutSeconds: number;
}

export interface X402ResourceParams {
  resourceUrl: string;
  method: "GET" | "POST";
  payTo: `0x${string}`;
  /** Precio en formato thirdweb: "$0.01". */
  price: string;
  routeConfig: X402RouteConfig;
}

/** 1 hora de validez de la firma de pago por defecto. */
const DEFAULT_TIMEOUT_SECONDS = 60 * 60;

/** Construye los params de un recurso x402 con validación. */
export function buildResourceParams(input: {
  resourceUrl: string;
  method?: "GET" | "POST";
  payTo: `0x${string}`;
  priceUsd: number;
  description: string;
}): X402ResourceParams {
  if (input.priceUsd <= 0) {
    throw new Error("x402 price must be positive. / El precio x402 debe ser positivo.");
  }
  return {
    resourceUrl: input.resourceUrl,
    method: input.method ?? "GET",
    payTo: input.payTo,
    price: `$${input.priceUsd.toFixed(2)}`,
    routeConfig: {
      description: input.description,
      mimeType: "application/json",
      maxTimeoutSeconds: DEFAULT_TIMEOUT_SECONDS,
    },
  };
}

/** Lee el header de pago x402 de un Request (soporta ambos nombres). */
export function readPaymentHeader(headers: Headers): string | null {
  return headers.get("PAYMENT-SIGNATURE") ?? headers.get("X-PAYMENT");
}
