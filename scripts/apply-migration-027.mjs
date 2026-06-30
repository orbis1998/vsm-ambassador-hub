import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "../supabase/migrations/027_social_story_views_rls.sql"), "utf8");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL manquant");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
try {
  await client.query(sql);
  console.log("Migration 027 appliquée avec succès.");
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes("already exists")) {
    console.log("Policies déjà présentes — rien à faire.");
  } else {
    console.error("Erreur:", msg);
    process.exit(1);
  }
} finally {
  await client.end();
}
