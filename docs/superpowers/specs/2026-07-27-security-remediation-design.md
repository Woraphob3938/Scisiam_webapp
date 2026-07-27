# SciSiam Security Remediation Design

Date: 2026-07-27  
Status: Approved design, pending implementation  
Scope: Local source code and forward-only migrations only; no production deployment, commit, or push

## Goal

Remediate all seven findings confirmed in security audit run 1 while preserving existing authentication, classroom, experiment, notification, and desktop release behavior.

## Global constraints

- Preserve the user's existing work and the two untracked security-scanning files.
- Use forward-only Supabase migrations; do not edit applied migrations.
- Update `src/lib/supabase/database.types.ts` for every new table or RPC signature.
- Add a regression test before each behavior change and observe the expected failure.
- Add no large dependency.
- Do not deploy migrations, commit, or push.
- Treat the existing Labs loading-overlay test failure as unrelated baseline state.
- Do not add undeployed migration versions to the test fixture that represents live Supabase history. Local-only forward migrations will intentionally leave the migration-history regression red until those exact files are deployed.
- Run focused tests, the full regression suite, lint, production build, desktop checks, secret scan, scanner checks where practical, and `graphify update .`.

## Selected approach

Use focused changes separated by trust boundary:

1. GitHub/Tauri release pipeline
2. Authentication request validation and redirect normalization
3. Server-owned AI rate limiting
4. Experiment snapshot integrity and storage staging limits
5. Bounded, idempotent Web Push delivery

Each database concern receives a separate forward migration so it can be reviewed and deployed independently.

## 1. Desktop release-signing boundary

### Intended behavior

Repository write permission must not by itself expose the production updater signing key. A release must require an explicit protected-environment approval and must be based on an approved commit reachable from `origin/main`.

### Workflow structure

`.github/workflows/release-desktop.yml` will use three jobs:

1. `verify`
   - Fetch complete history and `origin/main`.
   - Validate `app-v<semver>` without interpolating the tag into PowerShell source.
   - Read the tag through `$env:GITHUB_REF_NAME`.
   - Require the tagged commit to be an ancestor of `origin/main`.
   - Require the tag version to equal `src-tauri/tauri.conf.json`.
   - Run security checks, tests, lint, and desktop validation without production signing secrets.

2. `build`
   - Depend on `verify`.
   - Install dependencies with `npm ci --ignore-scripts`.
   - Build Windows artifacts using an ephemeral updater key generated within the job.
   - Upload the NSIS installer and updater archive as workflow artifacts.
   - Discard the ephemeral private key and signature.

3. `sign-and-release`
   - Depend on `build`.
   - Reference the `desktop-release` GitHub Environment.
   - Download only the previously built artifacts.
   - Install or obtain the pinned Tauri signer before signing secrets are exposed.
   - Expose `TAURI_SIGNING_PRIVATE_KEY` and password only to the single signer step.
   - Replace the ephemeral updater signature with the production signature.
   - Generate bounded `latest.json` from validated version, fixed repository URL, artifact name, and production signature.
   - Create a draft GitHub Release and upload the installer, updater archive, signature, and `latest.json`.
   - Publishing the draft remains a deliberate owner action.

### Required GitHub configuration

The workflow can reference but cannot secure an Environment by itself. Before using the workflow:

- Create `desktop-release`.
- Add a required reviewer and prevent self-review.
- Restrict deployment tags to `app-v*`.
- Disable administrator bypass when the repository plan supports it.
- Move both Tauri signing secrets from repository secrets to environment secrets.
- Protect `main` and the `app-v*` tag namespace.
- Rotate the updater key pair before the first updater-enabled public release. If a matching updater-enabled client has already been distributed elsewhere, use a staged key migration.

## 2. Authentication and redirect safety

### Shared redirect sanitizer

Create `src/lib/safe-redirect.ts`:

```ts
export function getSafeSameOriginPath(
  requestedPath: string | null | undefined,
  fallback: string,
  blockedPrefixes: readonly string[] = [],
): string
```

Rules:

- Require a leading `/`.
- Reject `//`, backslash, NUL, CR, and LF.
- Parse against a fixed invalid HTTPS origin.
- Require the parsed origin to remain the fixed origin.
- Return only normalized pathname, search, and hash.
- Reject configured blocked prefixes such as `/login`.

Both Login and OAuth callback use this helper.

### Trusted form POST helper

Create `src/lib/server/request-origin.ts`:

```ts
export function isTrustedSameOriginPost(request: Request): boolean
```

Rules:

- Reject `Sec-Fetch-Site: cross-site`.
- If `Origin` exists, require exact equality with `new URL(request.url).origin`.
- Otherwise require an exact-origin `Referer`.
- Reject malformed Origin or Referer.

`POST /auth/confirm` returns a safe 303 failure redirect before reading or consuming verification data when the request is not trusted.

### Email-confirmation session behavior

After a successful `type=email` verification, call local-scope Supabase sign-out before returning to `/login?confirmed=success`. This preserves email activation but ensures the response does not leave the token owner's authenticated session in the browser.

Recovery retains its verified session because `/reset-password` requires it.

## 3. Server-owned durable AI rate limiting

### Database API

Create a forward migration that:

- Revokes and drops the caller-parameterized public limiter.
- Revokes user-role execution of the private mutator.
- Creates:

```sql
public.consume_ai_rate_limit(p_user_id uuid) returns jsonb
```

Properties:

- `SECURITY DEFINER`
- fixed 60-second window
- fixed maximum of 12
- deterministic server-side key derived from `p_user_id`
- executable only by `service_role`
- no execution for `public`, `anon`, or `authenticated`
- deletes expired limiter rows opportunistically with a strict bounded age

### Route behavior

The AI route authenticates through the normal cookie-backed client, then calls `consume_ai_rate_limit` through `createAdminClient()`. If the durable limiter is unavailable, the bounded in-memory limiter remains the fallback.

The browser never receives an API that accepts limiter key, window, or maximum.

## 4. Snapshot integrity and storage limits

### Snapshot insert authorization

A new migration replaces snapshot Storage policies with helpers that:

- Acquire a transaction-scoped advisory lock derived from the authenticated user.
- Require path format `<uid>/<run-id>.webp`.
- Require the run ID in the path to exist and belong to `auth.uid()`.
- Require that run's `snapshot_path` is null.
- Permit at most five unreferenced snapshot objects per user.

The bucket keeps its existing private status, WebP-only MIME restriction, and 3 MiB per-object limit.

### Snapshot immutability

- DELETE is permitted only for the owner and only when no experiment run references the object path.
- `attach_experiment_run_snapshot` accepts only the deterministic owned-run path and sets `snapshot_path` only when it is null or already equal to the same path.
- An attached snapshot cannot be deleted, replaced, or rebound to another path.
- Teacher signed URLs continue to use the stored immutable path.

### Orphan cleanup

Add:

```sql
public.list_own_orphan_experiment_snapshots() returns setof text
```

It returns only the caller's unreferenced snapshot paths older than one hour. The experiment save flow opportunistically asks for those paths and removes them through the Storage API before a new snapshot upload. The five-object policy remains the authoritative bound if cleanup fails.

### Classroom staging atomicity

Replace `private.can_upload_classroom_file` with a volatile function that takes a transaction-scoped advisory lock on classroom/user before counting unreferenced staged objects. Concurrent Storage INSERT transactions therefore serialize around the existing limit of ten objects.

Referenced assignment/submission files remain readable and are not counted as staging objects.

## 5. Web Push delivery safety

### Subscription storage

A forward migration updates `upsert_push_subscription` to:

- Acquire a transaction advisory lock for `auth.uid()`.
- Validate HTTPS endpoint shape and reject whitespace/control characters.
- Validate `p256dh` and `auth` as bounded base64url values.
- Prevent one user from taking over an endpoint already owned by another user.
- Keep at most five subscriptions per user by deleting the oldest subscription before inserting a sixth.

### Idempotent delivery record

Create `public.assignment_push_deliveries` with:

- `assignment_id` primary key
- requester, status, attempt count, timestamps, sent count, and bounded error code
- RLS enabled with no browser-role table grants
- service-role-only access

The unique assignment key makes repeated owner requests idempotent.

### Route behavior

The route:

1. Validates Web Push configuration, request JSON, caller authentication, and assignment ownership.
2. Atomically inserts the delivery claim.
3. Returns `202` with `{ queued: true }`.
4. Uses Next.js `after()` to perform best-effort delivery after the response.

The background delivery:

- loads at most 500 recipients and 1,000 subscriptions
- sends in batches of ten
- sets a 5,000 ms socket timeout on every `sendNotification`
- deletes 404/410 endpoints
- records `completed` or `failed` without exposing provider details to clients

Assignment creation remains successful even when push delivery fails.

## Error handling

- Auth validation failures use existing neutral invalid-link destinations.
- Durable limiter failures fall back to memory; they never fail open without a limit.
- Optional snapshot cleanup/upload failure never invalidates the authoritative experiment run.
- Push failure never rolls back assignment creation and stores only bounded error codes.
- Migration functions raise existing SQLSTATE categories (`42501`, `22023`, `P0002`) so client error handling stays compatible.
- Release validation failures stop before any production secret is exposed.

## Test strategy

### New regression coverage

- Release workflow:
  - full-SHA pinned actions
  - protected environment reference
  - no job-wide signing secrets
  - tag read from environment, not expression interpolation
  - tag commit ancestry check
  - separated artifact build and signer jobs
- Auth:
  - cross-site POST rejected
  - Origin/Referer exact-match behavior
  - email confirmation clears the resulting session
  - recovery retains its session
- Redirect:
  - backslash, encoded backslash, NUL, CR/LF, and `//` rejected
  - normalized same-origin paths preserved
- AI:
  - no authenticated execute grant
  - fixed server function signature and policy
  - route uses admin client without caller-chosen key/window/max
- Snapshot/storage:
  - deterministic owned-run path check
  - attached object cannot be deleted
  - one-time attachment
  - orphan cap/cleanup API
  - advisory locking of classroom staging count
- Push:
  - five-subscription atomic cap
  - strict key validation and cross-user endpoint protection
  - idempotency table
  - `after()` scheduling
  - timeout and batch limit

### Verification

1. Run each focused test before implementation and confirm the expected security assertion fails.
2. Apply the minimum implementation for that boundary.
3. Rerun the focused test until it passes.
4. Run:
   - `npm test`
   - `npm run lint`
   - `npm run build`
   - relevant desktop tests and Rust checks
   - Gitleaks working-tree/history scan
   - Trivy dependency/misconfiguration scan
   - YAML parsing and diff checks
   - `graphify update .`
5. Report the unrelated Labs loading-overlay failure and the intentional local-versus-production migration-history failure separately. Do not weaken either assertion to make the suite appear green.

## Out of scope

- Applying migrations to the connected Supabase project
- Changing GitHub branch, tag, environment, reviewer, or secret settings
- Rotating the real Tauri key
- Publishing a desktop release
- Updating dependencies reported by Trivy; these require a separate compatibility pass
- Fixing unrelated UI regressions
