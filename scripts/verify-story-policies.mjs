import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
const { rows } = await client.query(
  `SELECT tablename, policyname FROM pg_policies
   WHERE tablename IN ('social_story_views', 'social_story_likes')
   ORDER BY tablename, policyname`,
);
console.log(rows);
await client.end();
