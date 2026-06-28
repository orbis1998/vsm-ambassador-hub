import pg from "pg";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const c = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

const profile = await c.query(`
  SELECT p.*, al.slug AS program_badge,
         array_agg(DISTINCT ur.role) AS roles
  FROM ambassador_links al
  JOIN profiles p ON p.id = al.ambassador_id
  LEFT JOIN user_roles ur ON ur.user_id = p.id
  WHERE al.slug = 'VSM-3219'
  GROUP BY p.id, al.slug
`);
console.log("VSM-3219 profile:", JSON.stringify(profile.rows[0], null, 2));

const levelTables = await c.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND (table_name ILIKE '%level%' OR table_name ILIKE '%tier%' OR table_name ILIKE '%rank%')
  ORDER BY 1
`);
console.log("\nLevel-related tables:", levelTables.rows.map((r) => r.table_name));

const levelCols = await c.query(`
  SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name ILIKE '%level%'
  ORDER BY table_name, column_name
`);
console.log("\nColumns with 'level':");
for (const r of levelCols.rows) console.log(`  ${r.table_name}.${r.column_name}`);

const distinctLevels = await c.query(`
  SELECT DISTINCT level, count(*) FROM profiles GROUP BY level ORDER BY count DESC
`);
console.log("\nDistinct profiles.level:", distinctLevels.rows);

await c.end();
