/**
 * Consulta la API de PRODUCCIÓN de Noah para descubrir qué stablecoins/redes
 * acepta — en particular si recibe USDT (u otra) en Celo mainnet. Eso decide si
 * el swap de Mento (USDT→cCOP) es necesario o sobra.
 *
 * Uso: poner NOAH_API_KEY (+ NOAH_SIGNING_PRIVATE_KEY si la API lo exige) en
 * .env.local y ejecutar:  npm run check-noah
 *
 * No escribe nada ni mueve dinero: solo GET de catálogo.
 */
import { readFileSync } from "node:fs";
import { SignJWT, importPKCS8 } from "jose";

// Carga simple de .env.local (sin dependencias extra).
function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    // sin .env.local: confiamos en el entorno
  }
}

const BASE = process.env.NOAH_API_BASE ?? "https://api.noah.com";

async function sign(body: object): Promise<string | null> {
  const pem = process.env.NOAH_SIGNING_PRIVATE_KEY;
  if (!pem) return null;
  const key = await importPKCS8(pem, "ES384");
  return new SignJWT({ body }).setProtectedHeader({ alg: "ES384" }).setIssuedAt().sign(key);
}

async function get(path: string) {
  const apiKey = process.env.NOAH_API_KEY;
  if (!apiKey) throw new Error("Falta NOAH_API_KEY en .env.local");
  const headers: Record<string, string> = { "X-Api-Key": apiKey };
  const sig = await sign({});
  if (sig) headers["Api-Signature"] = sig;
  const res = await fetch(`${BASE}${path}`, { headers });
  const text = await res.text();
  console.log(`\n=== GET ${path} → ${res.status} ===`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2).slice(0, 4000));
  } catch {
    console.log(text.slice(0, 2000));
  }
}

async function main() {
  loadEnvLocal();
  console.log(`Base: ${BASE}`);
  // Catálogos típicos de Noah para descubrir cripto/redes/monedas soportadas.
  await get("/channels/sell/countries");
  await get("/channels/sell");
  await get("/channels");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
