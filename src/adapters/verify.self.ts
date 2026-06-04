import { requireEnv } from "@/lib/env";
import type { VerifyPort, VerifyStatus } from "@/ports/verify.port";

const SELF_API_BASE = "https://app.ai.self.xyz";

/**
 * Adapter de VerifyPort con Self Agent ID. Consulta el estado de verificación
 * proof-of-human del agente. Falla fuerte sin SELF_APP_ID.
 *
 * UNCONFIRMED: el endpoint/forma exacta de la API de Self no está verificado en
 * esta sesión. No se inventa una respuesta: si la API falla o no existe, lanza.
 */
export class SelfVerifyAdapter implements VerifyPort {
  async status(agentAddress: `0x${string}`): Promise<VerifyStatus> {
    const appId = requireEnv("SELF_APP_ID");
    // UNCONFIRMED: ruta de la API. Se ajustará con la doc real de Self.
    const res = await fetch(`${SELF_API_BASE}/api/agent/${agentAddress}`, {
      headers: { "x-app-id": appId },
    });
    if (!res.ok) {
      throw new Error(
        `Self verify query failed (${res.status}). / Consulta de verificación Self falló.`,
      );
    }
    const data = (await res.json()) as { verified?: boolean; selfId?: string };
    return { verified: Boolean(data.verified), selfId: data.selfId };
  }
}
