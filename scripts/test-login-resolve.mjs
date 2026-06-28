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

const tests = ["VSM-F5B7", "fidexapay@gmail.com", "+243976028479"];
for (const id of tests) {
  const r = await c.query("SELECT * FROM resolve_ambassador_login($1)", [id]);
  console.log(id, "→", r.rows[0] ?? "NOT FOUND");
}

await c.end();
