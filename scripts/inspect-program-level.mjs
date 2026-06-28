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

const fns = await c.query(`
  SELECT proname, pg_get_functiondef(p.oid) AS def
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND (proname ILIKE '%ambassador%' OR proname ILIKE '%level%' OR proname ILIKE '%tier%')
  ORDER BY proname
`);
console.log("Functions:");
for (const r of fns.rows) {
  console.log("\n---", r.proname, "---");
  console.log(r.def.slice(0, 800));
}

await c.end();
