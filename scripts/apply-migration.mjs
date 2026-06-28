#!/usr/bin/env node
import pg from "pg";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const file = process.argv[2] ?? "supabase/migrations/021_message_read_by_rls.sql";
const sql = readFileSync(file, "utf8");

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
await c.query(sql);
console.log("Migration appliquée:", join(process.cwd(), file));
await c.end();
