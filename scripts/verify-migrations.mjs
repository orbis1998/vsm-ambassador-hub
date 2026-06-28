import pg from "pg";
const c = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const { rows } = await c.query(`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public'
    AND (table_name LIKE 'academy_%' OR table_name LIKE 'social_%')
  ORDER BY table_name
`);
console.log(rows.map((r) => r.table_name).join("\n"));
console.log(`\nTotal: ${rows.length} tables`);
await c.end();
