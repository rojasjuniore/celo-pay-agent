import { SignJWT, jwtVerify } from "jose";
import { requireEnv } from "@/lib/env";

/**
 * Sesión de usuario: tras verificar la firma de su wallet (SIWE-style), el
 * server emite un JWT HS256 firmado con SESSION_SECRET. Las rutas que necesitan
 * identidad verifican ese JWT y obtienen la wallet — NUNCA del body del cliente.
 * Esto cierra el IDOR: el cliente no puede falsificar quién es.
 */
const TTL_SECONDS = 60 * 60 * 24; // 24h

function secret(): Uint8Array {
  return new TextEncoder().encode(requireEnv("SESSION_SECRET"));
}

/** Emite un JWT de sesión para una wallet ya verificada por firma. */
export async function issueSession(wallet: `0x${string}`): Promise<string> {
  return new SignJWT({ wallet: wallet.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());
}

/** Verifica el JWT y devuelve la wallet, o null si es inválido/expirado. */
export async function walletFromSession(token: string | undefined): Promise<`0x${string}` | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const w = payload.wallet;
    return typeof w === "string" && /^0x[0-9a-fA-F]{40}$/.test(w) ? (w as `0x${string}`) : null;
  } catch {
    return null;
  }
}
