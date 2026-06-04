import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";
import { facilitator, settlePayment, wrapFetchWithPayment } from "thirdweb/x402";
import { privateKeyToAccount } from "thirdweb/wallets";
import { createWalletAdapter } from "thirdweb/wallets";
import { requireEnv } from "@/lib/env";
import { buildResourceParams } from "@/modules/payments/x402-config";
import type { PaymentPort, SettleRequest, SettleResult } from "@/ports/payment.port";

/**
 * Adapter de PaymentPort con thirdweb x402 sobre Celo. El agente paga (cliente)
 * y cobra (servidor) en USDT en Celo. Falla fuerte sin credenciales thirdweb.
 */
export class ThirdwebPaymentAdapter implements PaymentPort {
  private readonly client: ReturnType<typeof createThirdwebClient>;
  private readonly serverWallet: `0x${string}`;

  constructor() {
    this.client = createThirdwebClient({ secretKey: requireEnv("THIRDWEB_SECRET_KEY") });
    // La wallet servidor del agente: deriva de su private key.
    const account = privateKeyToAccount({
      client: this.client,
      privateKey: requireEnv("AGENT_PRIVATE_KEY"),
    });
    this.serverWallet = account.address as `0x${string}`;
  }

  async settle(req: SettleRequest): Promise<SettleResult> {
    const params = buildResourceParams({
      resourceUrl: req.resourceUrl,
      method: req.method,
      payTo: this.serverWallet,
      priceUsd: req.priceUsd,
      description: req.description,
    });
    const thirdwebFacilitator = facilitator({
      client: this.client,
      serverWalletAddress: this.serverWallet,
    });
    const result = await settlePayment({
      resourceUrl: params.resourceUrl,
      method: params.method,
      paymentData: req.paymentData,
      payTo: params.payTo,
      network: celo,
      price: params.price,
      facilitator: thirdwebFacilitator,
      routeConfig: params.routeConfig,
    });
    // El result es una unión: 200 trae paymentReceipt; 402 trae responseBody.
    return result.status === 200
      ? {
          status: 200,
          paymentReceipt: result.paymentReceipt,
          responseHeaders: result.responseHeaders,
        }
      : {
          status: result.status,
          responseBody: result.responseBody,
          responseHeaders: result.responseHeaders,
        };
  }

  async payFor(url: string, init?: RequestInit): Promise<Response> {
    const account = privateKeyToAccount({
      client: this.client,
      privateKey: requireEnv("AGENT_PRIVATE_KEY"),
    });
    // wrapFetchWithPayment espera un Wallet; envolvemos el Account con un adapter.
    const wallet = createWalletAdapter({
      client: this.client,
      adaptedAccount: account,
      chain: celo,
      onDisconnect: () => {},
      switchChain: () => {},
    });
    const fetchWithPay = wrapFetchWithPayment(fetch, this.client, wallet);
    return fetchWithPay(url, init);
  }
}
