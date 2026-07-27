import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("same-origin redirect sanitizer rejects browser normalization bypasses", async () => {
  const { getSafeSameOriginPath } = await import(
    "../src/lib/safe-redirect.ts"
  );

  for (const unsafe of [
    "//evil.example",
    "/\\evil.example",
    "/%5Cevil.example",
    "/a" + "\0" + "b",
    "/a\r\nb",
    "/%00hidden",
    "/%0d%0alocation",
  ]) {
    assert.equal(getSafeSameOriginPath(unsafe, "/labs"), "/labs");
  }

  assert.equal(
    getSafeSameOriginPath("/classrooms?id=1#work", "/labs"),
    "/classrooms?id=1#work",
  );
  assert.equal(
    getSafeSameOriginPath("/login?next=/classrooms", "/labs", ["/login"]),
    "/labs",
  );
});

test("confirmation POST requires exact same-origin browser metadata", async () => {
  const { isTrustedSameOriginPost } = await import(
    "../src/lib/server/request-origin.ts"
  );

  assert.equal(
    isTrustedSameOriginPost(
      new Request("https://scisiam.test/auth/confirm", {
        method: "POST",
        headers: {
          origin: "https://evil.test",
          "sec-fetch-site": "cross-site",
        },
      }),
    ),
    false,
  );
  assert.equal(
    isTrustedSameOriginPost(
      new Request("https://scisiam.test/auth/confirm", {
        method: "POST",
        headers: {
          origin: "https://scisiam.test",
          "sec-fetch-site": "same-origin",
        },
      }),
    ),
    true,
  );
  assert.equal(
    isTrustedSameOriginPost(
      new Request("https://scisiam.test/auth/confirm", {
        method: "POST",
        headers: { referer: "https://scisiam.test/auth/verify" },
      }),
    ),
    true,
  );
  assert.equal(
    isTrustedSameOriginPost(
      new Request("https://scisiam.test/auth/confirm", {
        method: "POST",
      }),
    ),
    false,
  );
});

test("email confirmation clears the OTP-created session", () => {
  const source = read("src/app/auth/confirm/route.ts");

  assert.match(source, /isTrustedSameOriginPost\(request\)/);
  assert.match(source, /isEmailConfirmation[\s\S]*auth\.signOut\(/);
  assert.match(source, /scope:\s*"local"/);
});

test("durable AI limiter is fixed-policy and service-role only", () => {
  const sql = read(
    "supabase/migrations/20260727083301_lock_ai_rate_limit_to_server.sql",
  );
  const route = read("src/app/api/ai-tutor/route.ts");

  assert.match(sql, /consume_ai_rate_limit\s*\(\s*p_user_id uuid\s*\)/i);
  assert.match(
    sql,
    /grant execute on function public\.consume_ai_rate_limit\(uuid\)\s+to service_role/i,
  );
  assert.doesNotMatch(
    sql,
    /grant execute on function public\.consume_ai_rate_limit\(uuid\)\s+to (?:anon|authenticated)/i,
  );
  assert.match(sql, /v_window interval := interval '60 seconds'/i);
  assert.match(sql, /v_limit integer := 12/i);
  assert.match(
    route,
    /createAdminClient\(\)[\s\S]*rpc\("consume_ai_rate_limit"/,
  );
  assert.doesNotMatch(
    route,
    /p_window_seconds|p_max_requests|p_client_key/,
  );
});

test("snapshot evidence is owned-run bound, immutable, and orphan bounded", () => {
  const sql = read(
    "supabase/migrations/20260727083338_harden_snapshot_and_staging_storage.sql",
  );

  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /can_upload_experiment_snapshot/i);
  assert.match(
    sql,
    /runs\.id\s*=\s*v_run_id[\s\S]*runs\.user_id\s*=\s*v_user_id[\s\S]*runs\.snapshot_path is null/i,
  );
  assert.match(sql, /v_orphan_count < 5/i);
  assert.match(
    sql,
    /can_delete_experiment_snapshot[\s\S]*not exists\s*\([\s\S]*runs\.snapshot_path = p_object_name/i,
  );
  assert.match(
    sql,
    /runs\.snapshot_path is null\s+or\s+runs\.snapshot_path = p_snapshot_path/i,
  );
  assert.match(sql, /list_own_orphan_experiment_snapshots/i);
  assert.match(
    sql,
    /can_upload_classroom_file[\s\S]*pg_advisory_xact_lock/i,
  );
});

test("Web Push is capped, idempotent, timed out, and backgrounded", () => {
  const sql = read(
    "supabase/migrations/20260727083406_bound_web_push_delivery.sql",
  );
  const route = read("src/app/api/push/classroom-assignment/route.ts");

  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /offset 4/i);
  assert.match(sql, /assignment_push_deliveries/i);
  assert.match(sql, /enable row level security/i);
  assert.match(
    route,
    /import\s+\{\s*after,\s*NextResponse\s*\}\s+from\s+"next\/server"/,
  );
  assert.match(route, /status:\s*202/);
  assert.match(route, /PUSH_TIMEOUT_MS\s*=\s*5_000/);
  assert.match(route, /PUSH_CONCURRENCY\s*=\s*10/);
  assert.match(route, /timeout:\s*PUSH_TIMEOUT_MS/);
  assert.match(route, /assignment_push_deliveries/);
});

test("service worker accepts lifecycle messages only from same-origin clients", () => {
  const source = read("public/sw.js");

  assert.match(source, /event\.source\?\.url/);
  assert.match(source, /new URL\(event\.source\.url\)/);
  assert.match(source, /sourceUrl\.origin !== self\.location\.origin/);
});

test("auth UI cache does not persist email outside explicit remember-me storage", () => {
  const source = read("src/lib/supabase/auth-cache.ts");

  assert.doesNotMatch(
    source,
    /localStorage\.setItem\("scisiam_user_email"/,
  );
  assert.match(source, /SCISIAM_REMEMBER_EMAIL_KEY/);
});
