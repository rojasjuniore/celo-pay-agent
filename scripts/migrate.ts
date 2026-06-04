/**
 * Aplica las migraciones SQL de drizzle (carpeta ./drizzle) a la base de datos
 * usando el driver pg estándar (compatible con Railway). Idempotente: usa la
 * tabla drizzle de control para no re-aplicar.
 *
 * Uso: cargar DATABASE_URL en el entorno y `npm run db:migrate`.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL");
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool);
  console.log("Aplicando migraciones a la base de datos…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ Migraciones aplicadas.");
  await pool.end();
}

main().catch((e) => {
  console.error("✗ Migración falló:", e.message);
  process.exit(1);
});
