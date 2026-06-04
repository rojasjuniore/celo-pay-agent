import {
  SelfBackendVerifier,
  DefaultConfigStore,
  AllIds,
} from "@selfxyz/core";
import { requireEnv } from "@/lib/env";

/**
 * Endpoint de verificación de Self (KYC ZK passport). La app Self envía aquí el
 * proof tras escanear el pasaporte; lo verificamos con el SDK real. Falla fuerte
 * si faltan SELF_SCOPE/SELF_ENDPOINT. No simula verificaciones.
 *
 * Firma real (@selfxyz/core): new SelfBackendVerifier(scope, endpoint,
 * mockPassport, allowedIds, configStorage, userIdentifierType) → verify(
 * attestationId, proof, pubSignals, userContextData).
 */
export async function POST(request: Request): Promise<Response> {
  const scope = requireEnv("SELF_SCOPE");
  const endpoint = requireEnv("SELF_ENDPOINT");

  const body = await request.json();
  const { attestationId, proof, pubSignals, userContextData } = body;
  if (!proof || !pubSignals || attestationId === undefined) {
    return Response.json(
      { status: "error", message: "Missing proof/pubSignals/attestationId." },
      { status: 400 },
    );
  }

  // Config mínima: humano real, sin restricción de edad/OFAC para el demo.
  const configStore = new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [],
    ofac: false,
  });

  const verifier = new SelfBackendVerifier(
    scope,
    endpoint,
    false, // mockPassport: false → pasaporte real en producción
    AllIds,
    configStore,
    "hex", // userIdentifierType: la wallet del usuario va en hex
  );

  const result = await verifier.verify(
    attestationId,
    proof,
    pubSignals,
    userContextData,
  );

  if (!result.isValidDetails.isValid) {
    return Response.json(
      { status: "error", message: "Verification failed." },
      { status: 400 },
    );
  }

  // Verificado: el userIdentifier queda asociado (lo persiste la capa de cuenta).
  return Response.json({
    status: "success",
    userIdentifier: result.userData.userIdentifier,
    nationality: result.discloseOutput?.nationality,
  });
}
