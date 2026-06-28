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

const users = await c.query(`
  SELECT id, email, raw_user_meta_data, raw_app_meta_data
  FROM auth.users
  WHERE id = '0835bd35-a4e6-4dd1-a5df-19fb59d63219'
`);
console.log(JSON.stringify(users.rows[0], null, 2));

const apps = await c.query(`
  SELECT full_name, username, phone, email FROM ambassador_applications
  WHERE user_id = '0835bd35-a4e6-4dd1-a5df-19fb59d63219'
  OR email = 'angelinaliyolo@gmail.com'
  ORDER BY created_at DESC LIMIT 3
`);
console.log("\napplications:", apps.rows);

await c.end();
