#!/usr/bin/env node
/**
 * Audit READ-ONLY du schéma Supabase VSM Ambassador Program.
 * Ne modifie RIEN en base. Génère docs/AUDIT_DB.md
 */
import pg from "pg";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL requis");
  process.exit(1);
}

const PLANNED_TABLES = [
  "users", "profiles", "ambassadors", "courses", "lessons", "videos", "quizzes",
  "quiz_answers", "missions", "certificates", "badges", "levels", "posts", "stories",
  "comments", "likes", "reactions", "followers", "messages", "conversations", "groups",
  "group_members", "notifications", "resources", "opportunities", "applications",
  "leaderboards", "weekly_challenges", "challenge_progress", "xp_history",
  "activity_logs", "settings", "push_subscriptions",
];

const QUERIES = {
  tables: `
    SELECT table_name, obj_description((quote_ident(table_schema)||'.'||quote_ident(table_name))::regclass) AS comment
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `,
  columns: `
    SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default,
           character_maximum_length, numeric_precision
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position
  `,
  pk: `
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `,
  fk: `
    SELECT
      tc.table_name AS from_table,
      kcu.column_name AS from_column,
      ccu.table_name AS to_table,
      ccu.column_name AS to_column,
      tc.constraint_name,
      rc.update_rule,
      rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints rc ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `,
  unique: `
    SELECT tc.table_name, kcu.column_name, tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'UNIQUE' AND tc.table_schema = 'public'
    ORDER BY tc.table_name
  `,
  indexes: `
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
  `,
  rls: `
    SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname
  `,
  policies: `
    SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname
  `,
  functions: `
    SELECT p.proname AS name, pg_get_function_arguments(p.oid) AS args,
           pg_get_function_result(p.oid) AS returns, p.prosecdef AS security_definer
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    ORDER BY p.proname
  `,
  enums: `
    SELECT t.typname AS enum_name, e.enumlabel AS value
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    ORDER BY t.typname, e.enumsortorder
  `,
  storage_buckets: `
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets
    ORDER BY name
  `,
  triggers: `
    SELECT event_object_table AS table_name, trigger_name, action_timing, event_manipulation, action_statement
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    ORDER BY event_object_table, trigger_name
  `,
};

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    const k = row[key];
    (acc[k] ??= []).push(row);
    return acc;
  }, {});
}

function proposeMigrations(existingTables, columnsByTable, policiesByTable, planned) {
  const existing = new Set(existingTables.map((t) => t.table_name));
  const proposals = [];

  const missing = planned.filter((t) => !existing.has(t));
  const extra = [...existing].filter((t) => !planned.includes(t));

  for (const table of missing) {
    proposals.push({
      type: "CREATE_TABLE",
      priority: "medium",
      table,
      reason: `Table planifiée par VSM Academy absente — à créer uniquement si aucune table équivalente n'existe.`,
      action: `CREATE TABLE public.${table} (...) — schéma à définir après validation`,
    });
  }

  // Auth login: check ambassadors for badge/email/phone
  if (existing.has("ambassadors")) {
    const cols = (columnsByTable["ambassadors"] ?? []).map((c) => c.column_name);
    if (!cols.includes("badge")) {
      proposals.push({
        type: "ALTER_TABLE",
        priority: "high",
        table: "ambassadors",
        reason: "Connexion par badge ambassadeur requise",
        action: "ALTER TABLE ambassadors ADD COLUMN badge TEXT UNIQUE;",
      });
    }
    if (!cols.includes("email") && !cols.includes("user_id")) {
      proposals.push({
        type: "ALTER_TABLE",
        priority: "high",
        table: "ambassadors",
        reason: "Liaison auth Supabase",
        action: "Vérifier colonne user_id FK vers auth.users",
      });
    }
  }

  // RLS gaps
  for (const table of existingTables) {
    const name = table.table_name;
    const policies = policiesByTable[name] ?? [];
    if (table.rls_enabled && policies.length === 0) {
      proposals.push({
        type: "RLS_POLICY",
        priority: "high",
        table: name,
        reason: "RLS activé mais aucune politique définie — table inaccessible côté client",
        action: `Créer politiques SELECT/INSERT/UPDATE adaptées pour ${name}`,
      });
    }
    if (!table.rls_enabled && !["schema_migrations", "spatial_ref_sys"].includes(name)) {
      proposals.push({
        type: "RLS_ENABLE",
        priority: "medium",
        table: name,
        reason: "RLS désactivé — données potentiellement exposées via API anon",
        action: `ALTER TABLE ${name} ENABLE ROW LEVEL SECURITY; + politiques`,
      });
    }
  }

  // Map extra tables as reuse candidates
  for (const t of extra) {
    const similar = planned.find((p) => t.includes(p) || p.includes(t.replace(/_/g, "")));
    proposals.push({
      type: "REUSE",
      priority: "info",
      table: t,
      reason: similar
        ? `Table existante probablement réutilisable à la place de « ${similar} »`
        : "Table existante du Programme Ambassadeur — à mapper dans l'app Academy",
      action: "Réutiliser telle quelle, enrichir si colonnes manquantes (ALTER ADD COLUMN)",
    });
  }

  return proposals;
}

async function main() {
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("✓ Connecté à Supabase PostgreSQL (lecture seule)\n");

  const results = {};
  for (const [key, sql] of Object.entries(QUERIES)) {
    try {
      const res = await client.query(sql);
      results[key] = res.rows;
      console.log(`  ${key}: ${res.rows.length} lignes`);
    } catch (e) {
      results[key] = { error: e.message };
      console.log(`  ${key}: ⚠ ${e.message}`);
    }
  }
  await client.end();

  const tables = results.tables?.error ? [] : results.tables;
  const columns = results.columns?.error ? [] : results.columns;
  const rlsStatus = results.rls?.error ? [] : results.rls;
  const policies = results.policies?.error ? [] : results.policies;

  const columnsByTable = groupBy(columns, "table_name");
  const policiesByTable = groupBy(policies, "tablename");
  const rlsByTable = Object.fromEntries(rlsStatus.map((r) => [r.table_name, r]));

  const tableNames = tables.map((t) => t.table_name);
  const existingSet = new Set(tableNames);
  const missingPlanned = PLANNED_TABLES.filter((t) => !existingSet.has(t));
  const extraTables = tableNames.filter((t) => !PLANNED_TABLES.includes(t));

  const tablesWithRls = rlsStatus.map((t) => ({
    ...t,
    policies: policiesByTable[t.table_name] ?? [],
  }));

  const migrations = proposeMigrations(
    rlsStatus.map((r) => ({ table_name: r.table_name, rls_enabled: r.rls_enabled })),
    columnsByTable,
    policiesByTable,
    PLANNED_TABLES,
  );

  const now = new Date().toISOString();
  let md = `# Audit Base de Données — VSM Ambassador Program\n\n`;
  md += `> **Généré le :** ${now}  \n`;
  md += `> **Mode :** lecture seule — aucune modification effectuée  \n`;
  md += `> **Projet :** ehmgjgrekjoaohnnlfmw (eu-west-1)  \n`;
  md += `> **Statut :** EN ATTENTE DE VALIDATION — ne pas exécuter les migrations sans accord\n\n`;
  md += `---\n\n`;

  md += `## Résumé exécutif\n\n`;
  md += `| Métrique | Valeur |\n|---|---|\n`;
  md += `| Tables public | ${tableNames.length} |\n`;
  md += `| Colonnes totales | ${columns.length} |\n`;
  md += `| Clés étrangères | ${results.fk?.length ?? 0} |\n`;
  md += `| Politiques RLS | ${policies.length} |\n`;
  md += `| Fonctions public | ${results.functions?.length ?? 0} |\n`;
  md += `| Types ENUM | ${new Set((results.enums ?? []).map((e) => e.enum_name)).size} |\n`;
  md += `| Buckets Storage | ${results.storage_buckets?.length ?? 0} |\n`;
  md += `| Tables planifiées absentes | ${missingPlanned.length} |\n`;
  md += `| Tables existantes hors plan | ${extraTables.length} |\n\n`;

  md += `---\n\n## 1. Tables existantes (${tableNames.length})\n\n`;
  for (const t of tables) {
    const rls = rlsByTable[t.table_name];
    const rlsFlag = rls?.rls_enabled ? "✅ RLS ON" : "❌ RLS OFF";
    const policyCount = (policiesByTable[t.table_name] ?? []).length;
    md += `### \`${t.table_name}\` — ${rlsFlag} (${policyCount} politiques)\n\n`;
    const cols = columnsByTable[t.table_name] ?? [];
    md += `| Colonne | Type | Nullable | Défaut |\n|---|---|---|---|\n`;
    for (const c of cols) {
      const type = c.character_maximum_length
        ? `${c.data_type}(${c.character_maximum_length})`
        : c.data_type;
      md += `| \`${c.column_name}\` | ${type} | ${c.is_nullable} | ${c.column_default ?? "—"} |\n`;
    }
    md += `\n`;
  }

  md += `---\n\n## 2. Relations (clés étrangères)\n\n`;
  if (results.fk?.length) {
    md += `| Table source | Colonne | → Table cible | Colonne | ON DELETE | ON UPDATE |\n`;
    md += `|---|---|---|---|---|---|\n`;
    for (const fk of results.fk) {
      md += `| \`${fk.from_table}\` | \`${fk.from_column}\` | \`${fk.to_table}\` | \`${fk.to_column}\` | ${fk.delete_rule} | ${fk.update_rule} |\n`;
    }
  } else {
    md += `_Aucune clé étrangère détectée dans le schéma public._\n`;
  }
  md += `\n`;

  md += `---\n\n## 3. Contraintes UNIQUE\n\n`;
  if (results.unique?.length) {
    for (const u of results.unique) {
      md += `- \`${u.table_name}.${u.column_name}\` (${u.constraint_name})\n`;
    }
  } else {
    md += `_Aucune contrainte UNIQUE explicite._\n`;
  }
  md += `\n`;

  md += `---\n\n## 4. Politiques RLS\n\n`;
  if (policies.length === 0) {
    md += `⚠️ **Aucune politique RLS trouvée** dans le schéma public.\n\n`;
  }
  const policiesGrouped = groupBy(policies, "tablename");
  for (const [table, pols] of Object.entries(policiesGrouped)) {
    md += `### \`${table}\`\n\n`;
    for (const p of pols) {
      md += `**${p.policyname}** (${p.cmd}) — rôles: ${p.roles} — permissive: ${p.permissive}\n\n`;
      md += `- USING: \`${p.qual ?? "true"}\`\n`;
      if (p.with_check) md += `- WITH CHECK: \`${p.with_check}\`\n`;
      md += `\n`;
    }
  }

  md += `---\n\n## 5. État RLS par table\n\n`;
  md += `| Table | RLS activé | Forcé | Nb politiques |\n|---|---|---|---|\n`;
  for (const t of rlsStatus) {
    const count = (policiesByTable[t.table_name] ?? []).length;
    md += `| \`${t.table_name}\` | ${t.rls_enabled ? "✅" : "❌"} | ${t.rls_forced ? "✅" : "❌"} | ${count} |\n`;
  }
  md += `\n`;

  md += `---\n\n## 6. Fonctions PostgreSQL (public)\n\n`;
  if (results.functions?.length) {
    for (const f of results.functions) {
      md += `- **\`${f.name}(${f.args})\`** → \`${f.returns}\`${f.security_definer ? " [SECURITY DEFINER]" : ""}\n`;
    }
  } else {
    md += `_Aucune fonction custom._\n`;
  }
  md += `\n`;

  md += `---\n\n## 7. Types ENUM\n\n`;
  const enumsGrouped = groupBy(results.enums ?? [], "enum_name");
  for (const [name, vals] of Object.entries(enumsGrouped)) {
    md += `- **\`${name}\`** : ${vals.map((v) => v.value).join(", ")}\n`;
  }
  if (!Object.keys(enumsGrouped).length) md += `_Aucun ENUM custom._\n`;
  md += `\n`;

  md += `---\n\n## 8. Storage Buckets\n\n`;
  if (results.storage_buckets?.length) {
    md += `| Bucket | Public | Limite taille |\n|---|---|---|\n`;
    for (const b of results.storage_buckets) {
      md += `| \`${b.name}\` | ${b.public ? "✅" : "❌"} | ${b.file_size_limit ?? "—"} |\n`;
    }
  } else {
    md += `_Aucun bucket ou accès storage non disponible._\n`;
  }
  md += `\n`;

  md += `---\n\n## 9. Comparaison avec le schéma planifié (VSM Academy)\n\n`;
  md += `### Tables planifiées ABSENTES (${missingPlanned.length})\n\n`;
  if (missingPlanned.length) {
    for (const t of missingPlanned) md += `- \`${t}\`\n`;
  } else {
    md += `_Toutes les tables planifiées existent._\n`;
  }
  md += `\n### Tables EXISTANTES hors plan Academy (${extraTables.length}) — à réutiliser\n\n`;
  if (extraTables.length) {
    for (const t of extraTables) md += `- \`${t}\`\n`;
  } else {
    md += `_Aucune table supplémentaire._\n`;
  }
  md += `\n`;

  md += `---\n\n## 10. Migrations proposées (NON EXÉCUTÉES)\n\n`;
  md += `> ⚠️ Ces propositions sont indicatives. **Aucune ne sera appliquée sans votre validation explicite.**\n\n`;

  const byPriority = { high: [], medium: [], info: [] };
  for (const m of migrations) {
    (byPriority[m.priority] ?? byPriority.info).push(m);
  }

  for (const [prio, label] of [
    ["high", "🔴 Priorité haute"],
    ["medium", "🟡 Priorité moyenne"],
    ["info", "ℹ️ Information / réutilisation"],
  ]) {
    const items = byPriority[prio];
    if (!items.length) continue;
    md += `### ${label}\n\n`;
    for (const m of items) {
      md += `#### [${m.type}] \`${m.table}\`\n\n`;
      md += `- **Raison :** ${m.reason}\n`;
      md += `- **Action proposée :** ${m.action}\n\n`;
    }
  }

  md += `---\n\n## 11. Recommandations avant intégration\n\n`;
  md += `1. **Valider ce rapport** — confirmer quelles tables réutiliser telles quelles.\n`;
  md += `2. **Ne pas créer de doublons** — enrichir les tables existantes via \`ALTER TABLE ADD COLUMN\` si besoin.\n`;
  md += `3. **Auth unifiée** — vérifier que \`auth.users\` est lié à \`ambassadors\` / \`profiles\` via \`user_id\`.\n`;
  md += `4. **RLS** — compléter les politiques manquantes avant mise en production client.\n`;
  md += `5. **Storage** — mapper les buckets existants (avatars, posts, certificats).\n`;
  md += `6. **RPC login** — créer \`resolve_ambassador_login(identifier)\` si absent, en SECURITY DEFINER.\n\n`;

  md += `---\n\n*Fin du rapport d'audit — VSM Ambassador Academy*\n`;

  mkdirSync(resolve(root, "docs"), { recursive: true });
  const mdPath = resolve(root, "docs", "AUDIT_DB.md");
  const jsonPath = resolve(root, "docs", "db-schema-report.json");

  writeFileSync(mdPath, md, "utf8");
  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: now,
        tables: tableNames,
        columns,
        foreignKeys: results.fk,
        policies,
        rls: rlsStatus,
        functions: results.functions,
        enums: results.enums,
        storage_buckets: results.storage_buckets,
        comparison: { missingPlanned, extraTables },
        proposedMigrations: migrations,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`\n📄 Rapport Markdown : docs/AUDIT_DB.md`);
  console.log(`📄 Rapport JSON    : docs/db-schema-report.json`);
}

main().catch((e) => {
  console.error("Erreur audit:", e.message);
  process.exit(1);
});
