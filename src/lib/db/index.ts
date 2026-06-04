import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { requireEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * Cliente Drizzle sobre Postgres estándar (node-postgres / pg). Compatible con
 * Railway, Supabase, RDS, etc. On-call para que importar el módulo no exija
 * DATABASE_URL; quien lo use falla fuerte si falta.
 */
let pool: Pool | undefined;

export function getDb() {
  if (!pool) {
    // TLS según la URL: `?sslmode=require` activa SSL con verificación. Railway
    // expone certs válidos; no desactivamos la verificación (evita MITM).
    pool = new Pool({ connectionString: requireEnv("DATABASE_URL") });
  }
  return drizzle(pool, { schema });
}

export { schema };
