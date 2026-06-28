#!/usr/bin/env node
/**
 * Exécute les migrations SQL dans supabase/migrations/ (ordre alphabétique 001→009).
 * Requiert DATABASE_URL dans l'environnement.
 */
import pg from "pg";
import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(__dirname, "../supabase/migrations");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL requis");
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

async function main() {
  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`✅ Connecté — ${files.length} migrations à exécuter\n`);

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    process.stdout.write(`▶ ${file} … `);
    try {
      await client.query(sql);
      console.log("OK");
    } catch (err) {
      console.log("ERREUR");
      console.error(`   ${err.message}`);
      if (err.position) console.error(`   position: ${err.position}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log("\n✅ Toutes les migrations ont été appliquées.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
