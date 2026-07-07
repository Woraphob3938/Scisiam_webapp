import { readFileSync } from "node:fs";

import { createClient } from "@supabase/supabase-js";

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
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  console.log(JSON.stringify({ ok: false, reason: "missing-config" }, null, 2));
  process.exit(0);
}

const supabase = createClient(url, publishableKey);
const { data, error, count } = await supabase
  .from("school_catalog")
  .select("id, name, province, education_area", { count: "exact" })
  .ilike("name", "%สตรี%")
  .limit(5);

if (error) {
  console.log(
    JSON.stringify(
      {
        ok: false,
        code: error.code,
        message: error.message,
        hint: error.hint ?? null,
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, count, rows: data }, null, 2));
