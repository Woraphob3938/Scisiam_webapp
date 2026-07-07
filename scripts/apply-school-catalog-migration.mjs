import { readFileSync } from "node:fs";

import pg from "pg";

function loadLocalEnv() {
  const env = {};
  const source = readFileSync(".env.local", "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex);
    const value = trimmed.slice(equalsIndex + 1).replace(/^['"]|['"]$/g, "");
    env[key] = value;
  }
  return env;
}

const env = loadLocalEnv();
const connectionString = env.SUPABASE_DATABASE_URL;

if (!connectionString) {
  console.error("SUPABASE_DATABASE_URL is missing from .env.local");
  process.exit(1);
}

const migrationPath = "supabase/migrations/20260707103000_add_school_catalog.sql";
const sql = readFileSync(migrationPath, "utf8");
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 30000,
  statement_timeout: 0,
  query_timeout: 0,
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select count(*)::int as count from public.school_catalog",
  );
  console.log(JSON.stringify({ ok: true, schoolCount: rows[0]?.count ?? null }));
} catch (error) {
  console.error(
    JSON.stringify({
      ok: false,
      code: error.code ?? null,
      message: error.message,
    }),
  );
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
