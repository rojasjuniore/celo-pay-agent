import { ThirdwebPaymentAdapter } from "@/adapters/payment.thirdweb";
import { readPaymentHeader } from "@/modules/payments/x402-config";

/**
 * Recurso x402: un quote de FX (USD→COP) gated por pago. El agente cliente
 * paga micro-cantidades en USDT para consumirlo → genera actividad onchain.
 */
export async function GET(request: Request): Promise<Response> {
  const adapter = new ThirdwebPaymentAdapter();
  const result = await adapter.settle({
    resourceUrl: request.url,
    method: "GET",
    paymentData: readPaymentHeader(request.headers),
    priceUsd: 0.01,
    description: "USD→COP FX quote for remittance routing",
  });

  if (result.status === 200) {
    // Pago liquidado: sirve el quote real (tasa la provee el bridge/off-ramp).
    return Response.json({ pair: "USD/COP", source: "mento+lifi" });
  }
  return Response.json(result.responseBody, {
    status: result.status,
    headers: result.responseHeaders,
  });
}
