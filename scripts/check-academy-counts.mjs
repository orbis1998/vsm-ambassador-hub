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
const counts = await c.query(
  "SELECT (SELECT count(*)::int FROM academy_courses) AS courses, (SELECT count(*)::int FROM academy_lessons) AS lessons, (SELECT count(*)::int FROM academy_quizzes) AS quizzes, (SELECT count(*)::int FROM academy_resources) AS resources",
);
console.log(counts.rows[0]);
const published = await c.query(
  "SELECT slug, title, is_parcours, is_published FROM academy_courses ORDER BY sort_order LIMIT 20",
);
console.log("Courses:", published.rows);
await c.end();
