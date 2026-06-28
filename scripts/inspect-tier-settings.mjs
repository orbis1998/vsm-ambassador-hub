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

const settings = await c.query(`SELECT * FROM settings WHERE key ILIKE '%level%' OR key ILIKE '%tier%' OR key ILIKE '%ambassador%' OR key ILIKE '%starter%'`);
console.log("settings:", settings.rows);

const allSettings = await c.query(`SELECT key, value FROM settings ORDER BY key LIMIT 50`);
console.log("\nAll settings keys:", allSettings.rows);

const uid = "0835bd35-a4e6-4dd1-a5df-19fb59d63219";
const sales = await c.query(`SELECT ambassador_confirmed_sales_count($1) AS sales`, [uid]);
console.log("\nVSM-3219 sales:", sales.rows[0]);

const ambassadors = await c.query(`
  SELECT p.id, p.email, p.full_name, p.name, al.slug,
         ambassador_confirmed_sales_count(p.id) AS sales
  FROM user_roles ur
  JOIN profiles p ON p.id = ur.user_id
  LEFT JOIN LATERAL (
    SELECT slug FROM ambassador_links al WHERE al.ambassador_id = p.id ORDER BY al.active DESC, al.created_at DESC LIMIT 1
  ) al ON true
  WHERE ur.role = 'ambassador'
  ORDER BY sales DESC
  LIMIT 10
`);
console.log("\nAmbassadors sales:");
for (const r of ambassadors.rows) console.log(r.slug, r.email, r.full_name || r.name, "sales=", r.sales);

await c.end();
