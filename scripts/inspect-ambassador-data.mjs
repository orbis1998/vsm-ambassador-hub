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

const linkCols = await c.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema='public' AND table_name='ambassador_links' ORDER BY ordinal_position
`);
console.log("ambassador_links:", linkCols.rows.map((r) => r.column_name).join(", "));

const links = await c.query(`
  SELECT al.id, al.ambassador_id, al.slug, p.email, p.phone, p.full_name, p.name
  FROM ambassador_links al
  JOIN profiles p ON p.id = al.ambassador_id
  LIMIT 5
`);
console.log("\nSample ambassador_links:");
for (const r of links.rows) console.log(JSON.stringify(r));

const roles = await c.query(`
  SELECT p.id, p.email, p.phone, p.full_name, p.role AS profile_role, array_agg(ur.role) AS roles
  FROM profiles p
  JOIN user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'ambassador'
  GROUP BY p.id, p.email, p.phone, p.full_name, p.role
  LIMIT 5
`);
console.log("\nAmbassadors via user_roles:");
for (const r of roles.rows) console.log(JSON.stringify(r));

const promoSample = await c.query(`
  SELECT pc.code, pc.ambassador_id, p.email, p.phone
  FROM promo_codes pc
  JOIN profiles p ON p.id = pc.ambassador_id
  WHERE pc.ambassador_id IS NOT NULL
  LIMIT 5
`);
console.log("\nSample promo_codes:");
for (const r of promoSample.rows) console.log(JSON.stringify(r));

await c.end();
