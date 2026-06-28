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

const cols = await c.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='profiles'
  ORDER BY ordinal_position
`);
console.log("=== profiles columns ===");
console.log(cols.rows.map((r) => r.column_name).join(", "));

const ambCount = await c.query(`
  SELECT count(*)::int AS n FROM profiles p
  WHERE p.role = 'ambassador'
     OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'ambassador')
`);
console.log("\nAmbassadors:", ambCount.rows[0].n);

const badgeStats = await c.query(`
  SELECT
    count(*) FILTER (WHERE badge IS NOT NULL AND badge <> '')::int AS with_badge,
    count(*)::int AS total
  FROM profiles
`);
console.log("Badge filled:", badgeStats.rows[0]);

const sample = await c.query(`
  SELECT id, role, name, full_name, email, phone, badge, level, xp, avatar_url
  FROM profiles
  WHERE role = 'ambassador'
     OR id IN (SELECT user_id FROM user_roles WHERE role = 'ambassador')
  LIMIT 5
`);
console.log("\nSample:");
for (const r of sample.rows) console.log(JSON.stringify(r));

const programTables = await c.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'academy_%' AND table_name NOT LIKE 'social_%'
  ORDER BY table_name
`);
console.log("\n=== Tables Programme (sans academy_/social_) ===");
console.log(programTables.rows.map((r) => r.table_name).join("\n"));

await c.end();
