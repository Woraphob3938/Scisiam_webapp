# SciSiam Security Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remediate all seven confirmed SciSiam security findings locally with forward-only migrations and regression-first verification.

**Architecture:** Keep each trust boundary independent: shared request utilities for redirects/authentication, service-role-only database entry points for privileged mutations, immutable Storage policies with advisory locking, bounded background Web Push delivery, and a build/sign/release pipeline that exposes production signing secrets only after environment approval. Every production change is driven by a focused failing regression test.

**Tech Stack:** Next.js 16.2.6, TypeScript, Node test runner, Supabase PostgreSQL/RLS/Storage, web-push 3.6.7, Tauri 2, GitHub Actions.

## Global Constraints

- Preserve all existing user work and the untracked security scanning files.
- Use `apply_patch` for edits and prefix shell commands with `rtk`.
- Use forward-only Supabase migrations; never modify applied migrations.
- Do not deploy migrations, commit, or push.
- Do not add undeployed migration versions to the deployed-history fixture.
- Add no large dependency.
- Observe every new security regression fail before writing its production fix.
- Keep the existing Labs loading-overlay failure separate.
- Expect the migration-history test to remain red until the new migrations are deployed.

---

### Task 1: Same-origin redirects and confirmation POSTs

**Files:**
- Create: `src/lib/safe-redirect.ts`
- Create: `src/lib/server/request-origin.ts`
- Create: `tests/security-remediation.test.mjs`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/auth/oauth-callback/route.ts`
- Modify: `src/app/auth/confirm/route.ts`

**Interfaces:**
- Produces: `getSafeSameOriginPath(requestedPath, fallback, blockedPrefixes)`
- Produces: `isTrustedSameOriginPost(request)`
- Consumes: existing Supabase server client and Next redirect APIs

- [x] **Step 1: Add direct failing tests for URL and request-origin behavior**

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("same-origin redirect sanitizer rejects browser normalization bypasses", async () => {
  const { getSafeSameOriginPath } = await import("../src/lib/safe-redirect.ts");
  for (const unsafe of ["//evil.example", "/\\evil.example", "/%5Cevil.example", "/a\0b", "/a\r\nb"]) {
    assert.equal(getSafeSameOriginPath(unsafe, "/labs"), "/labs");
  }
  assert.equal(getSafeSameOriginPath("/classrooms?id=1#work", "/labs"), "/classrooms?id=1#work");
  assert.equal(getSafeSameOriginPath("/login?next=/classrooms", "/labs", ["/login"]), "/labs");
});

test("confirmation POST requires exact same-origin browser metadata", async () => {
  const { isTrustedSameOriginPost } = await import("../src/lib/server/request-origin.ts");
  assert.equal(isTrustedSameOriginPost(new Request("https://scisiam.test/auth/confirm", {
    method: "POST",
    headers: { origin: "https://evil.test", "sec-fetch-site": "cross-site" },
  })), false);
  assert.equal(isTrustedSameOriginPost(new Request("https://scisiam.test/auth/confirm", {
    method: "POST",
    headers: { origin: "https://scisiam.test", "sec-fetch-site": "same-origin" },
  })), true);
});

test("email confirmation clears the OTP-created session", () => {
  const source = read("src/app/auth/confirm/route.ts");
  assert.match(source, /isTrustedSameOriginPost\(request\)/);
  assert.match(source, /isEmailConfirmation[\s\S]*auth\.signOut\(\{\s*scope:\s*"local"\s*\}\)/);
});
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `rtk node --test tests/security-remediation.test.mjs`

Expected: FAIL because both utility modules do not exist.

- [x] **Step 3: Implement the redirect utility**

```ts
export function getSafeSameOriginPath(
  requestedPath: string | null | undefined,
  fallback: string,
  blockedPrefixes: readonly string[] = [],
) {
  if (
    !requestedPath?.startsWith("/") ||
    requestedPath.startsWith("//") ||
    /[\\\0\r\n]/.test(requestedPath)
  ) return fallback;

  try {
    const base = new URL("https://scisiam.invalid");
    const destination = new URL(requestedPath, base);
    const normalized = `${destination.pathname}${destination.search}${destination.hash}`;
    return destination.origin === base.origin &&
      !blockedPrefixes.some((prefix) => destination.pathname.startsWith(prefix))
      ? normalized
      : fallback;
  } catch {
    return fallback;
  }
}
```

Use it from Login with fallback `/labs` and blocked prefix `/login`, and from OAuth callback with fallback `/profile`.

- [x] **Step 4: Implement exact-origin POST validation**

```ts
export function isTrustedSameOriginPost(request: Request) {
  const expectedOrigin = new URL(request.url).origin;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (origin) return origin === expectedOrigin;
  const referer = request.headers.get("referer");
  if (!referer) return false;
  try {
    return new URL(referer).origin === expectedOrigin;
  } catch {
    return false;
  }
}
```

Call it before `request.formData()`. After successful email verification, call:

```ts
const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
if (signOutError) {
  return NextResponse.redirect(new URL("/login?confirmed=invalid_link", url.origin), 303);
}
```

Recovery must not sign out.

- [x] **Step 5: Verify GREEN and compatible auth behavior**

Run:

```powershell
rtk node --test tests/security-remediation.test.mjs tests/password-recovery.test.mjs tests/mobile-push-notifications.test.mjs
```

Expected: PASS.

---

### Task 2: Service-role-only AI limiter

**Files:**
- Create: `supabase/migrations/20260727083301_lock_ai_rate_limit_to_server.sql`
- Modify: `tests/security-remediation.test.mjs`
- Modify: `src/app/api/ai-tutor/route.ts`
- Modify: `src/lib/supabase/database.types.ts`

**Interfaces:**
- Produces: `public.consume_ai_rate_limit(p_user_id uuid) returns jsonb`
- Consumes: `createAdminClient()` and authenticated `UsageContext.userId`

- [x] **Step 1: Add the failing limiter regression**

```js
test("durable AI limiter is fixed-policy and service-role only", () => {
  const sql = read("supabase/migrations/20260727083301_lock_ai_rate_limit_to_server.sql");
  const route = read("src/app/api/ai-tutor/route.ts");
  assert.match(sql, /consume_ai_rate_limit\s*\(\s*p_user_id uuid\s*\)/i);
  assert.match(sql, /grant execute[\s\S]*to service_role/i);
  assert.doesNotMatch(sql, /grant execute[\s\S]*to (?:anon|authenticated)/i);
  assert.match(sql, /v_window interval := interval '60 seconds'/i);
  assert.match(sql, /v_limit integer := 12/i);
  assert.match(route, /createAdminClient\(\)[\s\S]*rpc\("consume_ai_rate_limit"/);
  assert.doesNotMatch(route, /p_window_seconds|p_max_requests|p_client_key/);
});
```

- [x] **Step 2: Run and verify RED**

Run: `rtk node --test tests/security-remediation.test.mjs`

Expected: FAIL because the migration is absent and the route still passes caller-shaped parameters.

- [x] **Step 3: Add the forward migration**

The migration must:

```sql
begin;
revoke all on function public.check_ai_rate_limit(text, integer, integer)
  from public, anon, authenticated;
revoke all on function private.check_ai_rate_limit_internal(text, integer, integer)
  from public, anon, authenticated;
drop function if exists public.consume_ai_rate_limit(uuid);

create function public.consume_ai_rate_limit(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_window interval := interval '60 seconds';
  v_limit integer := 12;
  v_key text := encode(extensions.digest('user:' || p_user_id::text, 'sha256'), 'hex');
  v_count integer;
  v_reset_at timestamptz;
begin
  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22023';
  end if;
  delete from public.ai_rate_limits
  where updated_at < v_now - interval '1 day';
  insert into public.ai_rate_limits (client_key, window_start, request_count, updated_at)
  values (v_key, v_now, 1, v_now)
  on conflict (client_key) do update set
    window_start = case when public.ai_rate_limits.window_start <= v_now - v_window then v_now else public.ai_rate_limits.window_start end,
    request_count = case when public.ai_rate_limits.window_start <= v_now - v_window then 1 else public.ai_rate_limits.request_count + 1 end,
    updated_at = v_now
  returning request_count, window_start + v_window into v_count, v_reset_at;
  return jsonb_build_object('ok', true, 'allowed', v_count <= v_limit, 'count', v_count, 'limit', v_limit, 'reset_at', v_reset_at);
end;
$$;

revoke all on function public.consume_ai_rate_limit(uuid) from public, anon, authenticated;
grant execute on function public.consume_ai_rate_limit(uuid) to service_role;
commit;
```

Confirm the actual digest schema in this project before finalizing; use `extensions.digest` only when the installed extension schema is `extensions`.

- [x] **Step 4: Change the route and generated type**

`isRateLimited` takes `userId` and calls:

```ts
const admin = createAdminClient();
const { data, error } = await admin.rpc("consume_ai_rate_limit", {
  p_user_id: userId,
});
```

Database type:

```ts
consume_ai_rate_limit: {
  Args: { p_user_id: string };
  Returns: Json;
};
```

Remove the obsolete `check_ai_rate_limit` type after the route no longer uses it.

- [x] **Step 5: Verify GREEN**

Run: `rtk node --test tests/security-remediation.test.mjs tests/scisiam-regressions.test.mjs`

Expected: the new limiter test passes; the migration-history assertion fails only because the local migration is intentionally undeployed.

---

### Task 3: Immutable experiment snapshots and atomic staging

**Files:**
- Create: `supabase/migrations/20260727083338_harden_snapshot_and_staging_storage.sql`
- Modify: `tests/security-remediation.test.mjs`
- Modify: `src/lib/supabase/experiment-sync.ts`
- Modify: `src/lib/supabase/database.types.ts`

**Interfaces:**
- Produces: `private.can_upload_experiment_snapshot(text)`
- Produces: `private.can_delete_experiment_snapshot(text)`
- Produces: `public.list_own_orphan_experiment_snapshots() returns setof text`
- Consumes: deterministic `<uid>/<runId>.webp` path

- [x] **Step 1: Add failing Storage policy assertions**

```js
test("snapshot evidence is owned-run bound, immutable, and orphan bounded", () => {
  const sql = read("supabase/migrations/20260727083338_harden_snapshot_and_staging_storage.sql");
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /can_upload_experiment_snapshot/i);
  assert.match(sql, /runs\.id[\s\S]*runs\.user_id[\s\S]*runs\.snapshot_path is null/i);
  assert.match(sql, /count\(\*\)[\s\S]*< 5/i);
  assert.match(sql, /can_delete_experiment_snapshot[\s\S]*not exists/i);
  assert.match(sql, /snapshot_path is null\s+or\s+runs\.snapshot_path = p_snapshot_path/i);
  assert.match(sql, /list_own_orphan_experiment_snapshots/i);
  assert.match(sql, /can_upload_classroom_file[\s\S]*pg_advisory_xact_lock/i);
});
```

- [x] **Step 2: Run and verify RED**

Run: `rtk node --test tests/security-remediation.test.mjs`

Expected: FAIL because the migration is absent.

- [x] **Step 3: Implement the forward migration**

Create volatile SECURITY DEFINER policy helpers. The upload helper must:

```sql
v_user_id uuid := auth.uid();
v_run_id uuid;
perform pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('experiment-snapshots:' || v_user_id::text, 0)
);
if p_object_name !~ ('^' || v_user_id::text || '/[0-9a-f-]{36}\.webp$') then
  return false;
end if;
v_run_id := split_part(split_part(p_object_name, '/', 2), '.', 1)::uuid;
return exists (
  select 1 from public.experiment_runs as runs
  where runs.id = v_run_id
    and runs.user_id = v_user_id
    and runs.snapshot_path is null
) and (
  select count(*) from storage.objects as objects
  where objects.bucket_id = 'experiment-snapshots'
    and (storage.foldername(objects.name))[1] = v_user_id::text
    and not exists (
      select 1 from public.experiment_runs as runs
      where runs.snapshot_path = objects.name
    )
) < 5;
```

The delete helper returns true only when the caller owns the folder and no `experiment_runs.snapshot_path` references the path.

Replace INSERT/DELETE policies to use these helpers. Replace `attach_experiment_run_snapshot` so the update includes:

```sql
and (runs.snapshot_path is null or runs.snapshot_path = p_snapshot_path)
```

Create `list_own_orphan_experiment_snapshots()` that returns only caller-folder objects older than one hour and absent from every run reference.

Replace `private.can_upload_classroom_file` as `volatile` and acquire an advisory lock derived from classroom ID and user ID before the existing `< 10` count.

- [x] **Step 4: Add opportunistic client cleanup**

Before capture/upload:

```ts
const { data: orphanPaths } = await supabase.rpc("list_own_orphan_experiment_snapshots");
if (orphanPaths?.length) {
  await supabase.storage.from("experiment-snapshots").remove(orphanPaths.slice(0, 5));
}
```

Keep cleanup best-effort inside the existing optional snapshot `try`.

Add the RPC return type:

```ts
list_own_orphan_experiment_snapshots: {
  Args: Record<PropertyKey, never>;
  Returns: string[];
};
```

- [x] **Step 5: Verify GREEN**

Run:

```powershell
rtk node --test tests/security-remediation.test.mjs tests/security-hardening.test.mjs tests/experiment-snapshot.test.mjs tests/classrooms.test.mjs
```

Expected: PASS.

---

### Task 4: Bounded and idempotent Web Push

**Files:**
- Create: `supabase/migrations/20260727083406_bound_web_push_delivery.sql`
- Modify: `tests/security-remediation.test.mjs`
- Modify: `src/app/api/push/classroom-assignment/route.ts`
- Modify: `src/lib/supabase/database.types.ts`

**Interfaces:**
- Produces: `assignment_push_deliveries` service-only table
- Produces: atomic maximum of five subscriptions per user
- Consumes: Next.js `after()` and `webPush.sendNotification(..., { timeout: 5000 })`

- [x] **Step 1: Add failing Push assertions**

```js
test("Web Push is capped, idempotent, timed out, and backgrounded", () => {
  const sql = read("supabase/migrations/20260727083406_bound_web_push_delivery.sql");
  const route = read("src/app/api/push/classroom-assignment/route.ts");
  assert.match(sql, /pg_advisory_xact_lock/i);
  assert.match(sql, /count\(\*\)[\s\S]*(?:>=|>) 5/i);
  assert.match(sql, /assignment_push_deliveries/i);
  assert.match(sql, /enable row level security/i);
  assert.match(route, /import\s+\{\s*after\s*\}\s+from\s+"next\/server"/);
  assert.match(route, /status:\s*202/);
  assert.match(route, /timeout:\s*5_000/);
  assert.match(route, /PUSH_CONCURRENCY\s*=\s*10/);
  assert.doesNotMatch(route, /Promise\.allSettled\(\s*\(subscriptions/);
});
```

- [x] **Step 2: Run and verify RED**

Run: `rtk node --test tests/security-remediation.test.mjs`

Expected: FAIL because the migration, timeout, batching, and background scheduling do not exist.

- [x] **Step 3: Implement the subscription and delivery migration**

Update `upsert_push_subscription` with:

```sql
perform pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('push-subscriptions:' || auth.uid()::text, 0)
);
if normalized_p256dh !~ '^[A-Za-z0-9_-]{86,88}={0,2}$'
  or normalized_auth_key !~ '^[A-Za-z0-9_-]{20,24}={0,2}$' then
  raise exception 'Invalid push subscription' using errcode = '22023';
end if;
if exists (
  select 1 from public.push_subscriptions
  where endpoint = normalized_endpoint and user_id <> auth.uid()
) then
  raise exception 'Push endpoint belongs to another user' using errcode = '42501';
end if;
```

Before inserting a new endpoint, delete the caller's oldest rows until at most four remain. Create:

```sql
create table public.assignment_push_deliveries (
  assignment_id uuid primary key references public.classroom_assignments(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('queued', 'completed', 'failed')),
  attempt_count integer not null default 1 check (attempt_count between 1 and 3),
  sent_count integer not null default 0 check (sent_count between 0 and 1000),
  error_code text null check (error_code is null or char_length(error_code) <= 80),
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);
alter table public.assignment_push_deliveries enable row level security;
revoke all on table public.assignment_push_deliveries from public, anon, authenticated;
grant all on table public.assignment_push_deliveries to service_role;
```

- [x] **Step 4: Refactor route into queued background delivery**

Use:

```ts
import { after, NextResponse } from "next/server";
const PUSH_TIMEOUT_MS = 5_000;
const PUSH_CONCURRENCY = 10;
```

After authorization, insert the delivery claim with the admin client. Treat unique violation as `{ queued: false, duplicate: true }`.

Schedule:

```ts
after(async () => {
  await deliverAssignmentPush({ assignmentId, assignment, admin });
});
return NextResponse.json({ queued: true }, { status: 202 });
```

In `deliverAssignmentPush`, iterate by batch:

```ts
for (let index = 0; index < subscriptions.length; index += PUSH_CONCURRENCY) {
  const batch = subscriptions.slice(index, index + PUSH_CONCURRENCY);
  await Promise.allSettled(batch.map((subscription) =>
    webPush.sendNotification(toWebPushSubscription(subscription), payload, {
      TTL: 24 * 60 * 60,
      urgency: "high",
      timeout: PUSH_TIMEOUT_MS,
    })
  ));
}
```

Update the delivery row to `completed` or `failed` with bounded metadata.

- [x] **Step 5: Update table types and verify GREEN**

Add the table Row/Insert/Update definitions for `assignment_push_deliveries`.

Run:

```powershell
rtk node --test tests/security-remediation.test.mjs tests/mobile-push-notifications.test.mjs tests/classrooms.test.mjs
```

Expected: PASS.

---

### Task 5: Approval-gated isolated desktop signing

**Files:**
- Modify: `tests/tauri-desktop.test.mjs`
- Modify: `.github/workflows/release-desktop.yml`
- Modify: `README.md`

**Interfaces:**
- Produces: `verify`, `build`, and `sign-and-release` jobs
- Consumes: `desktop-release` GitHub Environment and its two Tauri secrets

- [x] **Step 1: Strengthen the workflow regression test**

```js
test("desktop release separates untrusted build work from approved signing", () => {
  const workflow = read(".github/workflows/release-desktop.yml");
  assert.match(workflow, /environment:\s*desktop-release/);
  assert.match(workflow, /git merge-base --is-ancestor/i);
  assert.match(workflow, /npm ci --ignore-scripts/);
  assert.match(workflow, /TAURI_SIGNING_PRIVATE_KEY:[\s\S]*secrets\.TAURI_SIGNING_PRIVATE_KEY/);
  assert.doesNotMatch(workflow, /jobs:\s*[\s\S]*env:\s*[\s\S]*TAURI_SIGNING_PRIVATE_KEY/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.match(workflow, /actions\/download-artifact@[0-9a-f]{40}/);
  assert.match(workflow, /releaseDraft:\s*true/);
  assert.doesNotMatch(workflow, /\$\{\{\s*github\.ref_name\s*\}\}[^]*Replace\(/);
});
```

- [x] **Step 2: Run and verify RED**

Run: `rtk node --test tests/tauri-desktop.test.mjs`

Expected: FAIL against the current single job and unpinned actions.

- [x] **Step 3: Rewrite the workflow**

Implement the three jobs from the design:

- `verify`: read `$env:GITHUB_REF_NAME`, validate `^app-v\d+\.\d+\.\d+$`, compare config version, fetch `origin/main`, and use `git merge-base --is-ancestor`.
- `build`: use pinned checkout/setup-node/Rust actions, `npm ci --ignore-scripts`, generate an ephemeral updater key, build NSIS updater artifacts, and upload only the installer/updater archive.
- `sign-and-release`: use `environment: desktop-release`, download artifacts, run the pinned Tauri signer with step-scoped production secrets, create bounded `latest.json`, and create a draft release.

All dynamic tag/version values enter PowerShell through `env:` variables rather than expression interpolation inside script source.

- [x] **Step 4: Document the mandatory repository settings**

Add a README checklist containing the exact Environment, reviewer, self-review, branch/tag restriction, secret move, protection, and key-rotation steps from the design.

- [x] **Step 5: Verify GREEN and YAML**

Run:

```powershell
rtk node --test tests/tauri-desktop.test.mjs
rtk node -e "const fs=require('fs'),y=require('js-yaml'); y.load(fs.readFileSync('.github/workflows/release-desktop.yml','utf8')); console.log('valid')"
```

Expected: tests PASS and YAML prints `valid`.

---

### Task 6: Full verification and audit handoff

**Files:**
- Modify: `C:/Users/HP/security-audit-skill/Scisiam_app/run-1/REPORT.md`
- Modify: `C:/Users/HP/security-audit-skill/Scisiam_app/run-1/findings.json` only to add remediation status metadata if the schema permits it; otherwise leave findings immutable

**Interfaces:**
- Consumes: all prior task outputs
- Produces: verified local remediation handoff

- [x] **Step 1: Run all focused security tests**

```powershell
rtk node --test tests/security-remediation.test.mjs tests/security-hardening.test.mjs tests/password-recovery.test.mjs tests/mobile-push-notifications.test.mjs tests/experiment-snapshot.test.mjs tests/classrooms.test.mjs tests/tauri-desktop.test.mjs
```

Expected: all focused tests PASS.

- [x] **Step 2: Run the full project checks**

```powershell
rtk npm test
rtk npm run lint
rtk npm run build
rtk cargo check --manifest-path src-tauri/Cargo.toml
```

Expected:

- lint/build/cargo check exit 0
- full suite may retain exactly:
  - the existing Labs loading-overlay failure
  - the intentional local-versus-deployed migration-history failure

No new unrelated failures are acceptable.

- [x] **Step 3: Run scanner and secret checks**

Run Gitleaks against history and the working tree, Trivy against dependency/configuration inputs with generated directories excluded, and the project secret regex. Confirm no real secret value appears.

- [x] **Step 4: Validate source state**

```powershell
rtk node C:\Users\HP\.codex\skills\security-audit\validate-findings.cjs C:\Users\HP\security-audit-skill\Scisiam_app\run-1\findings.json
rtk git diff --check
rtk graphify update .
rtk git status --short
```

Expected: schema valid, diff check clean, graph updated, and only intended local files changed.

- [x] **Step 5: Update the report**

Record each finding as locally remediated pending migration deployment/GitHub settings, list exact verification outputs, and clearly state that no production state, commit, or push occurred.

