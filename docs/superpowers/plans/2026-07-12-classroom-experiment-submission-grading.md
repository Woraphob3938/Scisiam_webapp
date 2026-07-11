# Classroom Experiment Submission and Grading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the scroll-dependent classroom tabs, connect lab assignments to real saved experiment runs, let students submit conclusions, and let classroom owners review and grade submissions from the teacher dashboard.

**Architecture:** Extend the existing classroom assignment/submission tables and guarded RPCs with lab, experiment-run, and grading fields. Keep `src/lib/supabase/classrooms.ts` as the client boundary, add two focused dialogs to the existing classroom page, and enrich the existing Supabase-backed teacher dashboard without adding a second grading system. Restore `Noto Sans Thai` through `next/font` while retaining `Kanit` for the Scisiam wordmark.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.4, TypeScript, Tailwind CSS v4, Radix Dialog, Supabase Postgres/Auth/RLS, Node test runner.

## Global Constraints

- Use real `experiment_runs`; never generate or fabricate experiment evidence.
- A lab submission must reference a run owned by the submitting student and matching the assignment lab.
- The classroom owner defines an integer maximum score from 1 to 100 when creating a lab assignment.
- A score may contain up to two decimals and must stay between zero and the assignment maximum.
- Students may edit an ungraded submission but graded submissions are read-only.
- General file/link assignments keep their current behavior and are not graded in this iteration.
- Keep all writes behind authenticated guarded RPCs; no direct browser insert/update grants.
- Keep all four classroom tabs visible without horizontal scrolling.
- Use `Noto Sans Thai` globally and `Kanit` only for `.scisiam-wordmark`.
- Add no dependencies and no generated bitmap assets.
- Do not push until tests, lint, build, migration verification, secret scan, browser QA, and diff checks pass.

---

## File Structure

- Create through Supabase CLI: migration named `classroom_experiment_grading`; it owns columns, constraints, indexes, and guarded RPCs.
- Modify `src/lib/supabase/database.types.ts`: generated-equivalent table and RPC types.
- Modify `src/lib/supabase/classrooms.ts`: assignment, run, submission, and grade view models plus client functions.
- Create `src/components/classrooms/ExperimentRunPreview.tsx`: read-only rendering of saved run data.
- Create `src/components/classrooms/ExperimentSubmissionDialog.tsx`: student run selection and conclusion submission.
- Create `src/components/classrooms/SubmissionReviewDialog.tsx`: teacher review and scoring.
- Modify `src/app/classrooms/[id]/page.tsx`: non-scroll tabs, assignment fields, student actions, dialogs, and query-driven review.
- Modify `src/components/profile/TeacherDashboard.tsx`: pending/graded status and direct review links.
- Modify `src/components/profile/TeacherDashboardSection.tsx`: pass grading fields to the dashboard.
- Modify `src/app/layout.tsx`, `src/app/globals.css`, `tests/typography.test.mjs`, and `DESIGN.md`: restore Noto Sans Thai without external CSS imports.
- Modify `PRODUCT.md` and classroom documentation: replace the previous no-grading boundary with the approved owner-defined classroom grading boundary.
- Modify `tests/classrooms.test.mjs`, `tests/classroom-workspace-ui.test.mjs`, `tests/product-consolidation.test.mjs`, and `tests/typography.test.mjs`: regression coverage.

### Task 1: Restore the Approved Thai Typography

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/typography.test.mjs`
- Modify: `DESIGN.md`

**Interfaces:**
- Produces: CSS variables `--font-noto-sans-thai` and `--font-kanit`.
- Consumes: existing `.scisiam-wordmark` class.

- [ ] **Step 1: Change the typography regression test first**

Assert that the root layout imports `Kanit` and `Noto_Sans_Thai`, loads Thai weights 400-800, and mounts both variables. Assert that all four Tailwind font tokens use `--font-noto-sans-thai`, while `.scisiam-wordmark` still uses `--font-kanit`. Continue rejecting `fonts.googleapis.com` CSS imports.

```js
test("uses Noto Sans Thai globally and Kanit for the Scisiam wordmark", () => {
  assert.match(rootLayout, /import \{ Kanit, Noto_Sans_Thai \} from "next\/font\/google"/);
  assert.match(rootLayout, /variable:\s*"--font-noto-sans-thai"/);
  assert.match(rootLayout, /variable:\s*"--font-kanit"/);
  assert.match(globalsCss, /--font-sans:\s*var\(--font-noto-sans-thai\), sans-serif/);
  assert.match(globalsCss, /\.scisiam-wordmark\s*\{[^}]*var\(--font-kanit\)/s);
  assert.doesNotMatch(globalsCss, /fonts\.googleapis\.com/);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test tests/typography.test.mjs`

Expected: FAIL because the layout still imports `Prompt`.

- [ ] **Step 3: Replace Prompt with Noto Sans Thai through `next/font`**

```tsx
import { Kanit, Noto_Sans_Thai } from "next/font/google";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

<html lang="th" className={`${notoSansThai.variable} ${kanit.variable} h-full antialiased`}>
```

Update the `@theme` font tokens to `var(--font-noto-sans-thai)` and update `DESIGN.md` to name Noto Sans Thai as the global UI font.

- [ ] **Step 4: Run the focused test and confirm GREEN**

Run: `node --test tests/typography.test.mjs`

Expected: PASS.

### Task 2: Add the Secure Classroom Grading Schema

**Files:**
- Create via CLI: `supabase migration new classroom_experiment_grading`
- Modify: the migration file path printed by the CLI command
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Extends `classroom_assignments` with `lab_id: string | null` and `max_score: number | null`.
- Extends `classroom_assignment_submissions` with `experiment_run_id`, `score`, `graded_by`, and `graded_at`.
- Produces RPCs:
  - `create_classroom_assignment(..., p_lab_id text, p_max_score smallint) returns uuid`
  - `submit_classroom_assignment(..., p_experiment_run_id uuid) returns uuid`
  - `grade_classroom_assignment_submission(p_submission_id uuid, p_score numeric) returns uuid`

- [ ] **Step 1: Add failing migration contract tests**

Extend `tests/classrooms.test.mjs` to assert:

```js
assert.match(migration, /add column lab_id text/);
assert.match(migration, /foreign key \(classroom_id, lab_id\)[\s\S]*references public\.classroom_labs/);
assert.match(migration, /add column max_score smallint/);
assert.match(migration, /add column experiment_run_id uuid/);
assert.match(migration, /grade_classroom_assignment_submission/);
assert.match(migration, /runs\.user_id = v_user_id/);
assert.match(migration, /runs\.lab_id = v_lab_id/);
assert.match(migration, /private\.is_class_creator\(v_classroom_id\)/);
assert.match(migration, /v_score > v_max_score/);
assert.match(migration, /revoke all on function public\.grade_classroom_assignment_submission/);
```

- [ ] **Step 2: Run the classroom tests and confirm RED**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL because the migration and grade RPC do not exist.

- [ ] **Step 3: Create the migration through the installed CLI**

Run: `supabase migration new classroom_experiment_grading`

Expected: one empty timestamped SQL file under `supabase/migrations/`.

- [ ] **Step 4: Add columns, checks, and indexes**

The migration must:

```sql
alter table public.classroom_assignments
  add column lab_id text null,
  add column max_score smallint null,
  add constraint classroom_assignments_lab_score_pair_check
    check ((lab_id is null and max_score is null) or (lab_id is not null and max_score between 1 and 100)),
  add constraint classroom_assignments_classroom_lab_fkey
    foreign key (classroom_id, lab_id)
    references public.classroom_labs (classroom_id, lab_id)
    on delete restrict;

alter table public.classroom_assignment_submissions
  add column experiment_run_id uuid null references public.experiment_runs(id) on delete restrict,
  add column score numeric(6,2) null,
  add column graded_by uuid null references public.profiles(id) on delete restrict,
  add column graded_at timestamptz null,
  add constraint classroom_submissions_grade_tuple_check
    check ((score is null and graded_by is null and graded_at is null)
      or (score is not null and graded_by is not null and graded_at is not null));

create index classroom_assignments_lab_id_idx on public.classroom_assignments (lab_id) where lab_id is not null;
create index classroom_submissions_experiment_run_id_idx on public.classroom_assignment_submissions (experiment_run_id) where experiment_run_id is not null;
create index classroom_submissions_graded_by_idx on public.classroom_assignment_submissions (graded_by) where graded_by is not null;
```

- [ ] **Step 5: Replace the two changed-signature RPCs without overload ambiguity**

Drop the exact current signatures before creating the expanded versions:

```sql
drop function if exists public.create_classroom_assignment(uuid, text, text, timestamptz, jsonb, jsonb);
drop function if exists public.submit_classroom_assignment(uuid, text, jsonb, jsonb);
```

The create RPC must validate that `p_lab_id` and `p_max_score` are both null or both present, and that the selected lab exists in `public.classroom_labs` for `p_classroom_id`.

The submit RPC must select authoritative `lab_id`, `max_score`, and current grade state. For lab assignments it requires a 20-1,000 character conclusion and an experiment run satisfying:

```sql
select exists (
  select 1
  from public.experiment_runs as runs
  where runs.id = p_experiment_run_id
    and runs.user_id = v_user_id
    and runs.lab_id = v_lab_id
) into v_run_is_valid;
```

Before updating an existing row, reject `graded_at is not null`. General assignments retain the current note/link/file validation.

- [ ] **Step 6: Add the owner-only grade RPC**

The RPC reads the submission, assignment, classroom, and authoritative maximum score; requires `private.is_class_creator(v_classroom_id)`; validates `p_score between 0 and v_max_score`; updates only an ungraded submission; and stores `score`, `graded_by = auth.uid()`, and `graded_at = now()`.

End all three RPC definitions with explicit privilege controls:

```sql
revoke all on function public.grade_classroom_assignment_submission(uuid, numeric) from public, anon;
grant execute on function public.grade_classroom_assignment_submission(uuid, numeric) to authenticated;
```

- [ ] **Step 7: Update database types and confirm GREEN**

Add the new table fields and RPC arguments to `database.types.ts`, including `grade_classroom_assignment_submission`.

Run: `node --test tests/classrooms.test.mjs`

Expected: PASS.

### Task 3: Extend the Supabase Classroom Client Boundary

**Files:**
- Modify: `src/lib/supabase/classrooms.ts`
- Modify: `tests/classrooms.test.mjs`

**Interfaces:**
- Produces `ClassroomExperimentRun` with run preview fields.
- Produces `listMyExperimentRunsForLab(labId: string): Promise<ClassroomExperimentRun[]>`.
- Extends `CreateClassroomAssignmentInput` with `labId` and `maxScore`.
- Extends `SubmitClassroomAssignmentInput` with `experimentRunId`.
- Produces `gradeClassroomAssignmentSubmission(submissionId: string, score: number): Promise<string>`.

- [ ] **Step 1: Add failing source-contract tests**

Assert that the client selects `variables`, `live_values`, `graph_points`, `table_rows`, `summary`, and `created_at` from `experiment_runs`; filters by `lab_id`; passes the new RPC arguments; and exposes the grade helper.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/classrooms.test.mjs`

Expected: FAIL on missing experiment-run and grading helpers.

- [ ] **Step 3: Implement the minimum client models and validation**

```ts
export type ClassroomExperimentRun = {
  id: string;
  labId: string;
  title: string | null;
  variables: Json;
  liveValues: Json;
  graphPoints: Json;
  tableRows: Json;
  summary: Json;
  createdAt: string;
};

export async function gradeClassroomAssignmentSubmission(
  submissionId: string,
  score: number,
): Promise<string> {
  if (!Number.isFinite(score) || score < 0) throw new Error("กรุณากรอกคะแนนที่ถูกต้อง");
  const supabase = createClient();
  await requireCurrentUserId(supabase);
  const { data, error } = await supabase.rpc("grade_classroom_assignment_submission", {
    p_submission_id: validateUuid(submissionId, "ไม่พบงานที่ต้องการตรวจ"),
    p_score: score,
  });
  if (error) throwClassroomActionError(error.code, error.message);
  if (!data) throw new Error("บันทึกคะแนนไม่สำเร็จ");
  return data;
}
```

Map all new assignment/submission fields from Supabase rows and keep validation at both client and database boundaries.

- [ ] **Step 4: Run focused tests and confirm GREEN**

Run: `node --test tests/classrooms.test.mjs`

Expected: PASS.

### Task 4: Remove Scroll-Dependent Tabs and Extend Assignment Creation

**Files:**
- Modify: `src/app/classrooms/[id]/page.tsx`
- Modify: `tests/classroom-workspace-ui.test.mjs`

**Interfaces:**
- Consumes: expanded `CreateClassroomAssignmentInput`.
- Produces: four always-visible tabs and lab/max-score assignment fields.

- [ ] **Step 1: Add failing UI regression tests**

Assert that the tab list uses `grid-cols-2 sm:grid-cols-4`, has no `overflow-x-auto`, and exposes all four Thai labels. Assert that the assignment form has `แล็บที่มอบหมาย` and `คะแนนเต็ม` controls.

- [ ] **Step 2: Run the UI test and confirm RED**

Run: `node --test tests/classroom-workspace-ui.test.mjs`

Expected: FAIL on the current horizontal tab classes and missing form fields.

- [ ] **Step 3: Replace the tab strip with a responsive grid**

Keep existing tab state and semantics, but render all items in:

```tsx
<div role="tablist" aria-label="ส่วนต่าง ๆ ของชั้นเรียน" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      className="min-h-11 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
    >
      {tab.label}
    </button>
  ))}
</div>
```

- [ ] **Step 4: Add assignment lab and score fields**

Use classroom `labIds` as the only options. `งานทั่วไป` maps to empty `labId` and null `maxScore`. Selecting a lab reveals a native numeric input with `min={1}`, `max={100}`, and `step={1}`. Reject submission when one field is missing.

- [ ] **Step 5: Run the UI test and confirm GREEN**

Run: `node --test tests/classroom-workspace-ui.test.mjs`

Expected: PASS.

### Task 5: Build the Student Experiment Submission Dialog

**Files:**
- Create: `src/components/classrooms/ExperimentRunPreview.tsx`
- Create: `src/components/classrooms/ExperimentSubmissionDialog.tsx`
- Modify: `src/app/classrooms/[id]/page.tsx`
- Modify: `tests/classroom-workspace-ui.test.mjs`

**Interfaces:**
- Consumes: `ClassroomAssignment`, `ClassroomAssignmentSubmission`, `ClassroomExperimentRun`, `listMyExperimentRunsForLab`, and `submitClassroomAssignment`.
- Produces: `ExperimentSubmissionDialog` props `{ assignment, existingSubmission, open, onOpenChange, onSubmitted }`.

- [ ] **Step 1: Add failing dialog state tests**

Protect the labels `ส่งงาน`, `แก้ไขงาน`, `ดูงานและคะแนน`, `สรุปผลการทดลอง`, the no-run simulation link, the 20-character minimum, and the read-only graded state.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/classroom-workspace-ui.test.mjs`

Expected: FAIL because the dialog components do not exist.

- [ ] **Step 3: Implement the read-only run preview**

Render the existing lab illustration from lab metadata, saved time, and bounded JSON sections. Use a small recursive formatter that accepts only primitives, arrays, and plain objects; cap arrays at 12 rows and object entries at 12 so malformed historical data cannot produce an unbounded modal. Graph data gets a text summary and a compact SVG polyline only when at least two numeric points can be normalized.

- [ ] **Step 4: Implement the accessible submission dialog**

On open, load runs for `assignment.labId`, preselect the existing submission run or newest eligible run, and preserve typed conclusion after request failures. Require 20-1,000 trimmed characters. Submit only the assignment id, selected run id, conclusion, and empty link/file arrays for lab assignments.

Use the existing Radix Dialog wrapper so focus is trapped, Escape closes, and focus returns to the trigger. The primary action stays disabled while loading or when no valid run is selected.

- [ ] **Step 5: Wire student assignment actions**

Owner rows keep owner controls. Student rows choose the label from submission state and open the dialog. After success, reload submissions and show a Sonner success message.

- [ ] **Step 6: Run focused tests and confirm GREEN**

Run: `node --test tests/classroom-workspace-ui.test.mjs tests/classrooms.test.mjs`

Expected: PASS.

### Task 6: Build Teacher Review, Grading, and Dashboard Links

**Files:**
- Create: `src/components/classrooms/SubmissionReviewDialog.tsx`
- Modify: `src/app/classrooms/[id]/page.tsx`
- Modify: `src/components/profile/TeacherDashboard.tsx`
- Modify: `src/components/profile/TeacherDashboardSection.tsx`
- Modify: `tests/classroom-workspace-ui.test.mjs`
- Modify: `tests/product-consolidation.test.mjs`

**Interfaces:**
- Consumes: submission grading fields and `gradeClassroomAssignmentSubmission`.
- Extends `TeacherSubmission` with `score`, `maxScore`, and `status`.
- Produces review URL `/classrooms/<classroom-id>?tab=classwork&submission=<submission-id>`.

- [ ] **Step 1: Add failing dashboard and review tests**

Assert that recent submissions show `รอตรวจ` or `<score>/<maxScore>`, use the direct submission query parameter, and the classroom page validates/open the review dialog only for owners.

- [ ] **Step 2: Run focused tests and confirm RED**

Run: `node --test tests/product-consolidation.test.mjs tests/classroom-workspace-ui.test.mjs`

Expected: FAIL on missing grade status and review dialog.

- [ ] **Step 3: Extend dashboard mapping**

Map authoritative assignment `maxScore` and submission `score`. Build the direct href with `URLSearchParams` rather than string concatenating untrusted ids.

```ts
const query = new URLSearchParams({ tab: "classwork", submission: submission.id });
const href = `/classrooms/${bundle.classroom.id}?${query.toString()}`;
```

- [ ] **Step 4: Implement the owner review dialog**

Render student identity, assignment, time, `ExperimentRunPreview`, conclusion, and score input. Use `min={0}`, `max={assignment.maxScore ?? 0}`, and `step="0.25"`. Show the maximum beside the field and retain the score after a network failure.

- [ ] **Step 5: Support query-driven review safely**

Read `submission` only after classroom data loads. Match it against the already-authorized submissions array and open the dialog only when `isOwner` is true. Invalid or inaccessible ids must not reveal whether another submission exists.

- [ ] **Step 6: Save and refresh**

Call the guarded grade helper, close on success, remove the `submission` query parameter, refresh the submission bundle, and show a success toast. The student view becomes read-only because the refreshed row has `gradedAt`.

- [ ] **Step 7: Run focused tests and confirm GREEN**

Run: `node --test tests/product-consolidation.test.mjs tests/classroom-workspace-ui.test.mjs tests/classrooms.test.mjs`

Expected: PASS.

### Task 7: Align Product Documentation and Verify End to End

**Files:**
- Modify: `PRODUCT.md`
- Modify: `README.md`
- Modify: `docs/00_Project_Overview.md`
- Verify: all files changed in Tasks 1-6

**Interfaces:**
- Produces deployment-ready code, migration, documentation, and verification evidence.

- [ ] **Step 1: Update the product boundary**

Replace the statement that teacher grading is out of scope with the narrow approved behavior: owner-defined maximum score and owner grading for experiment-linked classroom assignments only. Keep points, XP, rankings, and client-trusted scores disabled.

- [ ] **Step 2: Update the code graph**

Run: `graphify update .`

Expected: the graph updates without parse failures.

- [ ] **Step 3: Run full automated verification**

Run:

```powershell
npm test
npm run lint
npm run build
git diff --check
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: tests, lint, build, and diff checks pass; the secret scan contains only documented placeholders/pattern examples.

- [ ] **Step 4: Apply and verify the Supabase migration**

Discover commands first:

```powershell
supabase db push --help
supabase migration list --help
supabase db advisors --help
```

Then push the new migration to the linked project, verify local/remote migration history alignment, and run database advisors. Treat any security advisor finding as blocking.

- [ ] **Step 5: Run browser QA with real teacher and student sessions**

Use Computer Use after reading its guidance and confirmation references. Verify desktop and 390px mobile:

- Four tabs are visible without horizontal scrolling.
- Teacher creates a lab assignment with a maximum score.
- Student without a run sees the simulation link.
- Student with a saved matching run previews it, writes a conclusion, and submits.
- Teacher dashboard shows `รอตรวจ` and opens the exact submission.
- Teacher grades within range; out-of-range scores are rejected.
- Student sees the read-only work and score.
- Dialog keyboard focus, Escape, and focus return work.
- Console has no errors or hydration warnings.

- [ ] **Step 6: Commit all approved work**

```powershell
git add -A
git diff --cached --check
git commit -m "feat: add classroom experiment grading"
```

- [ ] **Step 7: Fast-forward and push `main` without force**

From the implementation branch, fetch `origin/main`, fast-forward local `main`, merge the implementation branch with `--ff-only`, rerun `git status --short --branch`, and push:

```powershell
git push origin main
```

Expected: `main` and `origin/main` point to the same new commit and the working tree is clean.
