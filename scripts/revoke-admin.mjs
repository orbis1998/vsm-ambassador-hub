#!/usr/bin/env node
/** Retire le rôle admin (garde ambassador). Usage: node scripts/revoke-admin.mjs VSM-3219 */
import pg from "pg";
import { readFileSync } from "node:fs";

const input = (process.argv[2] ?? "").trim();
if (!input) {
  console.error("Usage: node scripts/revoke-admin.mjs VSM-3219");
  process.exit(1);
}

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1)];
    }),
);

const c = new pg.Client({ connectionString: env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await c.connect();

let userId = input;
if (input.toUpperCase().startsWith("VSM")) {
  const badge = input.toUpperCase().replace(/\s/g, "").startsWith("VSM-")
    ? input.toUpperCase().replace(/\s/g, "")
    : `VSM-${input.replace(/VSM/i, "")}`;
  const { rows } = await c.query(
    "SELECT ambassador_id FROM ambassador_links WHERE upper(slug) = $1 LIMIT 1",
    [badge],
  );
  if (!rows[0]) {
    console.error(`Badge ${badge} introuvable`);
    process.exit(1);
  }
  userId = rows[0].ambassador_id;
}

await c.query("DELETE FROM user_roles WHERE user_id = $1 AND role = 'admin'", [userId]);
await c.query(
  `UPDATE profiles SET role = CASE
     WHEN EXISTS (SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'ambassador') THEN 'ambassador'
     ELSE 'user' END
   WHERE id = $1`,
  [userId],
);

const check = await c.query(
  `SELECT p.id, al.slug, p.role,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') AS is_admin,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'ambassador') AS is_ambassador
   FROM profiles p
   LEFT JOIN ambassador_links al ON al.ambassador_id = p.id AND al.active = true
   WHERE p.id = $1`,
  [userId],
);
console.log("Admin retiré:", check.rows[0]);
await c.end();
