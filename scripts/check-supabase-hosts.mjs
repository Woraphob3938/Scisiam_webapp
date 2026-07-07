import { readFileSync } from "node:fs";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
  const equalsIndex = trimmed.indexOf("=");
  env[trimmed.slice(0, equalsIndex)] = trimmed
    .slice(equalsIndex + 1)
    .replace(/^['"]|['"]$/g, "");
}

const publicRef = env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0]
  : null;
const dbHost = env.SUPABASE_DATABASE_URL
  ? new URL(env.SUPABASE_DATABASE_URL).hostname
  : null;
const dbRef = dbHost?.startsWith("db.") ? dbHost.split(".")[1] : null;

console.log(JSON.stringify({ publicRef, dbHost, dbRef }, null, 2));
