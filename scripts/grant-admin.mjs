#!/usr/bin/env node
/**
 * Accorde le rôle admin à un utilisateur (user_roles + profiles.role).
 * Usage: node scripts/grant-admin.mjs VSM-3219
 *    ou: node scripts/grant-admin.mjs admin01@gmail.com
 *    ou: node scripts/grant-admin.mjs <uuid>
 */
import pg from "pg";
import { readFileSync } from "node:fs";

const input = (process.argv[2] ?? "").trim();
if (!input) {
  console.error("Usage: node scripts/grant-admin.mjs VSM-3219");
  console.error("   ou: node scripts/grant-admin.mjs admin01@gmail.com");
  console.error("   ou: node scripts/grant-admin.mjs <uuid>");
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

const c = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();

let userId = input;
if (input.includes("@")) {
  const { rows } = await c.query("SELECT id FROM profiles WHERE lower(email) = $1 LIMIT 1", [
    input.toLowerCase().trim(),
  ]);
  if (!rows[0]) {
    const { rows: authRows } = await c.query(
      "SELECT id FROM auth.users WHERE lower(email) = $1 LIMIT 1",
      [input.toLowerCase().trim()],
    );
    if (!authRows[0]) {
      console.error(`Email ${input} introuvable`);
      process.exit(1);
    }
    userId = authRows[0].id;
  } else {
    userId = rows[0].id;
  }
} else if (input.toUpperCase().startsWith("VSM")) {
  const slug = input.toUpperCase().replace(/\s/g, "");
  const badge = slug.startsWith("VSM-") ? slug : `VSM-${slug.replace("VSM", "")}`;
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

await c.query(
  `INSERT INTO user_roles (user_id, role) VALUES ($1, 'admin')
   ON CONFLICT DO NOTHING`,
  [userId],
);
await c.query("UPDATE profiles SET role = 'admin' WHERE id = $1", [userId]);

const check = await c.query(
  `SELECT p.id, p.email, al.slug AS badge, p.role,
    EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') AS has_admin_role
   FROM profiles p
   LEFT JOIN ambassador_links al ON al.ambassador_id = p.id AND al.active = true
   WHERE p.id = $1`,
  [userId],
);
console.log("Admin accordé:", check.rows[0]);
await c.end();
