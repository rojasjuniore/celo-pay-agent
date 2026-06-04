import { createThirdwebClient } from "thirdweb";
import { requireEnv } from "@/lib/env";

/**
 * Cliente thirdweb para el servidor (verificación de firmas). Usa el SECRET_KEY.
 * Lazy: no rompe el import si falta; falla fuerte al usarse sin credencial.
 */
let cached: ReturnType<typeof createThirdwebClient> | undefined;

export function getThirdwebServerClient() {
  if (!cached) {
    cached = createThirdwebClient({ secretKey: requireEnv("THIRDWEB_SECRET_KEY") });
  }
  return cached;
}
