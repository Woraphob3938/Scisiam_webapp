# Experiment Snapshot Submissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture a private image of each saved experiment scene and show it in wider student-submission and teacher-review dialogs with a 5-1,000 character conclusion requirement.

**Architecture:** Keep the existing experiment-save RPC unchanged and authoritative. After a run saves, a browser-only helper captures the experiment scene, uploads a bounded WebP to a private bucket, and attaches its storage path through a new owner-guarded RPC; every snapshot step is best-effort and cannot change the successful run result. Classroom helpers resolve short-lived signed URLs only after existing student ownership or classroom-owner checks.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript, Supabase Postgres/Auth/Storage, Tailwind CSS v4, `html-to-image@1.11.13`, Node regression tests.

## Global Constraints

- Store only a relative `snapshot_path`; never persist public URLs or base64 image data.
- Keep `experiment-snapshots` private, WebP-only, and limited to 3 MB per object.
- Snapshot capture/upload failure must never make a successfully saved experiment run fail.
- Preserve existing classroom creator checks, run ownership checks, grading bounds, and notification behavior.
- Lab conclusions must contain 5-1,000 characters in both UI and database validation.
- Existing runs without snapshots remain valid and display a no-image fallback.
- Do not commit until the user explicitly asks.

---

### Task 1: Private Snapshot Schema And Authorization

**Files:**
- Create: `supabase/migrations/<timestamp>_experiment_run_snapshots.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `tests/classrooms.test.mjs`
- Modify: `tests/security-hardening.test.mjs`

**Interfaces:**
- Produces: nullable `experiment_runs.snapshot_path`.
- Produces: `public.attach_experiment_run_snapshot(p_run_id uuid, p_snapshot_path text) returns boolean`.
- Produces: private bucket `experiment-snapshots` and guarded Storage policies.
- Produces: `get_classroom_submission_experiment_run` JSON containing `snapshot_path`.

- [ ] **Step 1: Add failing migration regression tests**

Add assertions that the newest migration contains:

```js
assert.match(sql, /add column snapshot_path text/i);
assert.match(sql, /values \('experiment-snapshots', 'experiment-snapshots', false, 3145728/i);
assert.match(sql, /allowed_mime_types[\s\S]*image\/webp/i);
assert.match(sql, /create or replace function public\.attach_experiment_run_snapshot/i);
assert.match(sql, /runs\.user_id = auth\.uid\(\)/i);
assert.match(sql, /private\.is_class_creator/i);
assert.match(sql, /Lab conclusion must contain 5-1000 characters/i);
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/classrooms.test.mjs tests/security-hardening.test.mjs`

Expected: FAIL because the migration and generated types do not yet expose snapshots.

- [ ] **Step 3: Add the forward migration**

The migration must:

```sql
alter table public.experiment_runs
  add column snapshot_path text null
  check (
    snapshot_path is null
    or (char_length(snapshot_path) between 1 and 512 and snapshot_path !~ '(^/|\.\.)')
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('experiment-snapshots', 'experiment-snapshots', false, 3145728, array['image/webp'])
on conflict (id) do update set
  public = false,
  file_size_limit = 3145728,
  allowed_mime_types = array['image/webp'];
```

Create owner insert/read/delete policies where `(storage.foldername(name))[1] = auth.uid()::text`. Create a security-definer read helper that additionally permits `private.is_class_creator(submission.classroom_id)` only when `experiment_runs.snapshot_path = storage.objects.name` and the run is referenced by that classroom submission. Recreate `get_classroom_submission_experiment_run` with its current owner authorization and add `'snapshot_path', runs.snapshot_path` to the returned JSON.

Create the attachment RPC with these checks:

```sql
if auth.uid() is null then
  raise exception 'Authentication required' using errcode = '42501';
end if;

if split_part(p_snapshot_path, '/', 1) <> auth.uid()::text
   or p_snapshot_path !~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$' then
  raise exception 'Invalid experiment snapshot path' using errcode = '22023';
end if;

update public.experiment_runs
set snapshot_path = p_snapshot_path
where id = p_run_id and user_id = auth.uid();
```

Recreate the guarded classroom submission RPC without changing any other branch and replace only:

```sql
if char_length(coalesce(normalized_note, '')) not between 5 and 1000 then
  raise exception 'Lab conclusion must contain 5-1000 characters' using errcode = '22023';
end if;
```

- [ ] **Step 4: Update database TypeScript types**

Add `snapshot_path: string | null` to experiment run `Row`, `snapshot_path?: string | null` to `Insert`/`Update`, and:

```ts
attach_experiment_run_snapshot: {
  Args: { p_run_id: string; p_snapshot_path: string };
  Returns: boolean;
};
```

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/classrooms.test.mjs tests/security-hardening.test.mjs`

Expected: PASS.

---

### Task 2: Best-Effort Browser Snapshot Capture

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/experiment-snapshot.ts`
- Modify: `src/lib/supabase/experiment-sync.ts`
- Create: `tests/experiment-snapshot.test.mjs`
- Modify: `tests/scisiam-regressions.test.mjs`

**Interfaces:**
- Produces: `captureExperimentSnapshot(): Promise<Blob | null>`.
- Produces: `uploadExperimentSnapshot(supabase, userId, runId, blob): Promise<string | null>`.
- Consumes: existing successful `save_experiment_run` result.

- [ ] **Step 1: Install the focused capture dependency**

Run: `npm install html-to-image@1.11.13`

Expected: only `package.json` and `package-lock.json` dependency metadata changes.

- [ ] **Step 2: Write failing snapshot helper tests**

Assert the helper:

```js
assert.match(source, /simulation-stage-scene/);
assert.match(source, /toCanvas/);
assert.match(source, /image\/webp/);
assert.match(source, /0\.85/);
assert.match(source, /MAX_SNAPSHOT_WIDTH = 1920/);
assert.match(source, /MAX_SNAPSHOT_BYTES = 3 \* 1024 \* 1024/);
```

Assert `experiment-sync.ts` calls snapshot work only after `save_experiment_run`, attaches with `attach_experiment_run_snapshot`, catches snapshot errors, and still returns `{ ok: true, runId: data }`.

- [ ] **Step 3: Run tests and verify failure**

Run: `node --test tests/experiment-snapshot.test.mjs tests/scisiam-regressions.test.mjs`

Expected: FAIL because the helper does not exist.

- [ ] **Step 4: Implement capture and upload helpers**

Use a dynamic import so the capture library stays browser-only:

```ts
const { toCanvas } = await import("html-to-image");
const target = document.querySelector<HTMLElement>('[data-testid="simulation-stage-scene"]')
  ?? document.querySelector<HTMLElement>("main svg")?.parentElement
  ?? null;
if (!target) return null;

const scale = Math.min(1, MAX_SNAPSHOT_WIDTH / Math.max(1, target.scrollWidth));
const canvas = await toCanvas(target, {
  cacheBust: true,
  pixelRatio: Math.max(1, window.devicePixelRatio * scale),
  backgroundColor: "#f8fafc",
});
const blob = await canvasToWebp(canvas, 0.85);
return blob.size <= MAX_SNAPSHOT_BYTES ? blob : null;
```

Upload to `experiment-snapshots/<userId>/<runId>.webp` with `contentType: "image/webp"`, `upsert: false`.

- [ ] **Step 5: Integrate after the authoritative save**

After receiving `data` from `save_experiment_run`:

```ts
try {
  const snapshot = await captureExperimentSnapshot();
  if (snapshot) {
    const path = await uploadExperimentSnapshot(supabase, user.id, data, snapshot);
    if (path) {
      const { error: attachError } = await supabase.rpc("attach_experiment_run_snapshot", {
        p_run_id: data,
        p_snapshot_path: path,
      });
      if (attachError) await supabase.storage.from("experiment-snapshots").remove([path]);
    }
  }
} catch {
  // Snapshot is optional; the experiment run is already saved.
}
return { ok: true, runId: data };
```

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/experiment-snapshot.test.mjs tests/scisiam-regressions.test.mjs`

Expected: PASS.

---

### Task 3: Signed Snapshot URLs And Shared Preview UI

**Files:**
- Modify: `src/lib/supabase/classrooms.ts`
- Modify: `src/components/classrooms/ClassroomLabSubmissionDialog.tsx`
- Modify: `src/app/classrooms/[id]/page.tsx`
- Modify: `tests/classroom-workspace-ui.test.mjs`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Produces: `ClassroomExperimentRun.snapshot_path: string | null` and `snapshotUrl: string | null`.
- Consumes: private bucket policy and guarded teacher RPC from Task 1.
- Reuses: `ExperimentRunPreview` for student and teacher.

- [ ] **Step 1: Add failing classroom UI/data tests**

Assert:

```js
assert.match(dialog, /max-w-6xl/);
assert.match(dialog, /grid[\s\S]*lg:grid-cols/);
assert.match(dialog, /snapshotUrl/);
assert.match(dialog, /ภาพหน้าการทดลอง/);
assert.match(dialog, /minLength=\{5\}/);
assert.match(dialog, /5-1,000 ตัวอักษร/);
assert.match(classrooms, /createSignedUrl/);
assert.match(classrooms, /experiment-snapshots/);
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/classroom-workspace-ui.test.mjs tests/classrooms.test.mjs`

Expected: FAIL on missing snapshot fields and old conclusion limit.

- [ ] **Step 3: Resolve signed URLs in classroom helpers**

Select `snapshot_path` in `listMyExperimentRunsForLab`. Add:

```ts
async function withExperimentSnapshotUrl(
  supabase: SupabaseClient,
  run: ClassroomExperimentRunRow,
): Promise<ClassroomExperimentRun> {
  if (!run.snapshot_path) return { ...run, snapshotUrl: null };
  const { data, error } = await supabase.storage
    .from("experiment-snapshots")
    .createSignedUrl(run.snapshot_path, 3600);
  return { ...run, snapshotUrl: error ? null : data.signedUrl };
}
```

Apply the same mapper to the JSON returned by `getClassroomSubmissionExperimentRun`; its RPC already verifies the teacher owns the classroom.

- [ ] **Step 4: Make the shared preview image-first and responsive**

Change the student dialog to `max-w-6xl`. In `ExperimentRunPreview`, render:

```tsx
<div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
  <div className="overflow-hidden rounded-xl bg-slate-100">
    {run.snapshotUrl ? (
      <Image
        src={run.snapshotUrl}
        alt={`ภาพหน้าการทดลอง ${labsById[run.lab_id]?.thaiTitle ?? run.title ?? "ห้องแล็บ"}`}
        width={1280}
        height={720}
        unoptimized
        className="h-auto w-full object-contain"
      />
    ) : (
      <p className="grid min-h-48 place-items-center text-sm font-semibold text-slate-500">
        ไม่มีภาพการทดลองสำหรับรายการนี้
      </p>
    )}
  </div>
  <div>{/* existing variables, live values, and summary */}</div>
</div>
```

Change the conclusion to `minLength={5}`, helper text `5-1,000 ตัวอักษร`, and disable submit only when `conclusion.trim().length < 5`.

- [ ] **Step 5: Widen teacher review without duplicating preview logic**

Change the teacher review `DialogContent` to the same viewport-safe `max-w-6xl`. Keep `<ExperimentRunPreview run={run} />`, conclusion, existing score input, and grading action unchanged.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/classroom-workspace-ui.test.mjs tests/classrooms.test.mjs`

Expected: PASS.

---

### Task 4: Deploy Migration And Verify End To End

**Files:**
- Modify only if verification reveals a scoped defect in files already listed above.

**Interfaces:**
- Verifies all outputs from Tasks 1-3 together.

- [ ] **Step 1: Apply and lint the forward migration**

Run: `npx supabase db push --linked`

Expected: the new migration applies once without editing deployed history.

Run: `npx supabase db lint --linked`

Expected: no new errors.

- [ ] **Step 2: Run repository verification**

Run:

```powershell
npm test
npm run lint
npm run build
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: all tests, lint, and build pass; secret scan shows placeholders/documentation only.

- [ ] **Step 3: Browser QA as a student**

At desktop and 390 px mobile:

1. Open a classroom lab assignment.
2. Change simulation variables and save a run.
3. Open `ส่งงาน`; confirm the wide/stacked layout shows the captured experiment image.
4. Enter 4 characters and confirm submit remains disabled.
5. Enter 5 characters and submit successfully.

- [ ] **Step 4: Browser QA as the classroom owner**

1. Open the teacher dashboard/classroom submission.
2. Confirm the same experiment image and conclusion appear.
3. Grade within the assignment maximum and confirm the existing notification/status flow remains intact.

- [ ] **Step 5: Update the code graph and report remaining warnings**

Run: `graphify update .`

Expected: graph rebuild succeeds. Report snapshot capture limitations for unsupported browser DOM features, if any, without treating them as failed experiment saves.
