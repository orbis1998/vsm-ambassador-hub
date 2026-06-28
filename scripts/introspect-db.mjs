#!/usr/bin/env node
/**
 * Analyse le schéma Supabase existant sans modifier la base.
 * Usage : npm run db:introspect
 *
 * Requiert DATABASE_URL ou SUPABASE_SERVICE_ROLE_KEY + VITE_SUPABASE_URL dans .env
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnv() {
  const envPath = resolve(root, ".env");
  if (!existsSync(envPath)) {
    console.error("❌ Fichier .env introuvable. Copiez .env.example et renseignez les clés.");
    process.exit(1);
  }
  const vars = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) vars[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return vars;
}

async function introspectWithServiceRole(url, serviceKey) {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  if (!res.ok) throw new Error(`REST introspection failed: ${res.status}`);
  const spec = await res.json();
  const tables = Object.keys(spec.definitions ?? {}).filter((k) => !k.includes("."));
  return { tables, definitions: spec.definitions };
}

async function introspectWithPg(databaseUrl) {
  let pg;
  try {
    pg = await import("pg");
  } catch {
    console.warn("⚠️  Module 'pg' non installé. Installez-le : npm i -D pg");
    return null;
  }
  const client = new pg.default.Client({ connectionString: databaseUrl });
  await client.connect();

  const tablesRes = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  const relationsRes = await client.query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `);

  const rlsRes = await client.query(`
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `);

  const columnsRes = await client.query(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `);

  await client.end();

  return {
    tables: tablesRes.rows.map((r) => r.table_name),
    relations: relationsRes.rows,
    rls: rlsRes.rows,
    columns: columnsRes.rows,
  };
}

async function main() {
  const env = loadEnv();
  const url = env.VITE_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const databaseUrl = env.DATABASE_URL;

  console.log("🔍 Introspection VSM Ambassador — base existante\n");

  let report = { generatedAt: new Date().toISOString(), source: "", tables: [], details: {} };

  if (databaseUrl && !databaseUrl.includes("[password]")) {
    console.log("→ Connexion PostgreSQL directe…");
    const pgData = await introspectWithPg(databaseUrl);
    if (pgData) {
      report.source = "postgresql";
      report.tables = pgData.tables;
      report.details = pgData;
      console.log(`✓ ${pgData.tables.length} tables trouvées`);
      console.log(`✓ ${pgData.relations.length} relations FK`);
      console.log(`✓ ${pgData.rls.length} politiques RLS`);
    }
  } else if (url && serviceKey && !serviceKey.includes("your-")) {
    console.log("→ Introspection via Supabase REST…");
    const restData = await introspectWithServiceRole(url, serviceKey);
    report.source = "supabase-rest";
    report.tables = restData.tables;
    report.details = { definitions: restData.definitions };
    console.log(`✓ ${restData.tables.length} entités REST trouvées`);
  } else {
    console.error("❌ Configurez DATABASE_URL ou SUPABASE_SERVICE_ROLE_KEY dans .env");
    process.exit(1);
  }

  const outDir = resolve(root, "docs");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "db-schema-report.json");
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Rapport écrit : ${outPath}`);

  // Comparaison avec tables planifiées dans l'app
  const planned = [
    "users","profiles","ambassadors","courses","lessons","videos","quizzes",
    "quiz_answers","missions","certificates","badges","levels","posts","stories",
    "comments","likes","reactions","followers","messages","conversations","groups",
    "group_members","notifications","resources","opportunities","applications",
    "leaderboards","weekly_challenges","challenge_progress","xp_history",
    "activity_logs","settings","push_subscriptions",
  ];

  const existing = new Set(report.tables);
  const missing = planned.filter((t) => !existing.has(t));
  const extra = report.tables.filter((t) => !planned.includes(t));

  console.log("\n── Comparaison schéma planifié vs existant ──");
  if (missing.length) console.log(`Tables à créer (migration) : ${missing.join(", ")}`);
  else console.log("✓ Toutes les tables planifiées existent déjà");
  if (extra.length) console.log(`Tables existantes à réutiliser : ${extra.join(", ")}`);
}

main().catch((e) => {
  console.error("Erreur:", e.message);
  process.exit(1);
});
