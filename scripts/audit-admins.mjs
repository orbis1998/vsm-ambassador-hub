#!/usr/bin/env node
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

const admins = await c.query(`
  SELECT p.id, p.email, p.role AS profile_role, p.full_name,
    EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') AS has_user_role_admin,
    (SELECT array_agg(ur.role ORDER BY ur.role) FROM user_roles ur WHERE ur.user_id = p.id) AS roles
  FROM profiles p
  WHERE p.role = 'admin'
     OR EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin')
  ORDER BY p.email NULLS LAST
`);
console.log("=== Admins (profiles + user_roles) ===");
console.table(admins.rows);

const mismatches = await c.query(`
  SELECT p.id, p.email, p.role AS profile_role,
    EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin') AS has_user_role_admin
  FROM profiles p
  WHERE (p.role = 'admin' AND NOT EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'))
     OR (p.role IS DISTINCT FROM 'admin' AND EXISTS(SELECT 1 FROM user_roles ur WHERE ur.user_id = p.id AND ur.role = 'admin'))
`);
console.log("\n=== Mismatches (profile.role vs user_roles) ===");
console.table(mismatches.rows);

const admin01 = await c.query(`
  SELECT u.id, u.email, u.email_confirmed_at IS NOT NULL AS email_confirmed,
    p.role AS profile_role,
    (SELECT count(*)::int FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'admin') AS admin_role_count
  FROM auth.users u
  LEFT JOIN profiles p ON p.id = u.id
  WHERE lower(u.email) = 'admin01@gmail.com'
`);
console.log("\n=== admin01@gmail.com ===");
console.table(admin01.rows);

await c.end();
