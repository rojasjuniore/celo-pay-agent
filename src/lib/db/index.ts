import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { requireEnv } from "@/lib/env";
import * as schema from "./schema";

/**
 * Cliente Drizzle sobre Neon (HTTP serverless). On-call para que importar este
 * módulo no exija DATABASE_URL; quien lo use falla fuerte si falta.
 */
export function getDb() {
  const sql = neon(requireEnv("DATABASE_URL"));
  return drizzle(sql, { schema });
}

export { schema };
