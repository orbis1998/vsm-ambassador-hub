#!/usr/bin/env node
/**
 * Synchronise profiles.role ↔ user_roles pour les comptes admin.
 * Usage: node scripts/sync-admin-roles.mjs
 */
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

const inserted = await c.query(`
  INSERT INTO user_roles (user_id, role)
  SELECT p.id, 'admin'
  FROM profiles p
  WHERE p.role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'
    )
  ON CONFLICT DO NOTHING
  RETURNING user_id
`);
console.log(`user_roles insérés: ${inserted.rowCount}`);

const updated = await c.query(`
  UPDATE profiles p
  SET role = 'admin'
  WHERE EXISTS (
    SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'
  )
  AND p.role IS DISTINCT FROM 'admin'
  RETURNING id, email
`);
console.log(`profiles mis à jour: ${updated.rowCount}`);
if (updated.rows.length) console.table(updated.rows);

await c.end();
