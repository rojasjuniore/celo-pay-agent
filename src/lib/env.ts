import { z } from "zod";

/**
 * Validación de variables de entorno. Todas son OPCIONALES a nivel de parseo:
 * el agente arranca sin todas las credenciales, pero cada adapter exige las
 * suyas vía `requireEnv` (fail-loud). Así un módulo que no usa Pinata no se
 * cae porque falte PINATA_JWT.
 *
 * CELO_RPC_URL es el único con default: es config pública (RPC de Celo), no un
 * dato de negocio ni una credencial.
 */

const CELO_RPC_DEFAULT = "https://forno.celo.org";

// Vars opcionales sin `.min(1)`: un string vacío debe llegar hasta requireEnv
// para que sea ÉL quien falle con el mensaje bilingüe, no el parser de Zod.
const EnvSchema = z.object({
  OPENROUTER_API_KEY: z.string().optional(),
  AGENT_PRIVATE_KEY: z.string().optional(),
  CELO_RPC_URL: z.string().url().default(CELO_RPC_DEFAULT),
  THIRDWEB_SECRET_KEY: z.string().optional(),
  THIRDWEB_CLIENT_ID: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  SELF_APP_ID: z.string().optional(),
  // Self Protocol (KYC ZK passport): scope + endpoint público del verifier.
  SELF_SCOPE: z.string().optional(),
  SELF_ENDPOINT: z.string().optional(),
  TREASURY_ADDRESS: z.string().optional(),
  REVENUE_FEE_BPS: z.string().optional(),
  // Off-ramp global (Noah). El agente envía USDT directo en Celo a esta address.
  NOAH_DEPOSIT_ADDRESS: z.string().optional(),
  NOAH_API_KEY: z.string().optional(),
  NOAH_SIGNING_PRIVATE_KEY: z.string().optional(),
  NOAH_API_BASE: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  AGENT_PUBLIC_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;
export type EnvKey = keyof Env;

/** Fuente de env vars; más laxa que NodeJS.ProcessEnv para inyectar en tests. */
export type EnvSource = Record<string, string | undefined>;

/**
 * Parsea el entorno on-call (no a nivel de módulo) para que importar este
 * archivo nunca rompa, y para poder inyectar un `source` en tests sin tocar
 * el `process.env` global.
 */
export function getEnv(source: EnvSource = process.env): Env {
  return EnvSchema.parse(source);
}

/**
 * Devuelve el valor de una env var requerida por un adapter. Si falta o está
 * vacía, falla fuerte: nunca devuelve placeholder ni dato falso.
 */
export function requireEnv(
  key: EnvKey,
  source: EnvSource = process.env,
): string {
  const value = getEnv(source)[key];
  if (value === undefined || value === "") {
    throw new Error(
      `Missing required env var ${key}. / Falta la variable de entorno requerida ${key}.`,
    );
  }
  return value;
}
