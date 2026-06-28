# Profile Navigation, Lab Cards, and Score Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Labs the primary destination, consolidate history and rewards in Profile, remove all student and teacher scoring behavior, simplify lab cards with Thai-first titles, and apply the Pastel Blush Mathematics theme.

**Architecture:** Reuse the existing route, navigation, profile, history, card, and shared simulation components. Disable scoring at the two shared write boundaries plus one forward Supabase migration, while retaining dormant database columns for compatibility. Preserve the user’s existing dirty work and never stage `.superpowers/`, `graphify-out/`, recovery files, or test logs.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase/Postgres, Node test runner.

---

## File Map

- `src/app/page.tsx`: redirect `/` to `/labs`.
- `src/app/history/page.tsx`: compatibility redirect to `/profile?tab=history`.
- `src/components/Sidebar.tsx`: desktop navigation with three destinations.
- `src/components/MobileTabBar.tsx`: mobile navigation with three destinations.
- `src/app/profile/page.tsx`: Overview, Learning History, and Rewards tabs.
- `src/components/history/LearningHistoryPage.tsx`: reusable history content without its own application shell or scores.
- `src/components/Navbar.tsx`: remove point counter and point cache synchronization.
- `src/lib/supabase/learning-snapshot.ts`: learning completion and run history without score fields.
- `src/lib/supabase/auth-cache.ts`: authentication cache only.
- `src/lib/supabase/experiment-sync.ts`: persist experiments without scores or point awards.
- `src/lib/supabase/missions.ts`: persist mission completion without points, XP, or levels.
- `src/app/missions/page.tsx`: completion and reward UI without numeric rewards.
- `src/components/profile/TeacherDashboard.tsx`: progress, result, and feedback UI without grades or score exports.
- `src/components/profile/TeacherDashboardSection.tsx`: qualitative review state and handlers.
- `src/components/LabCard.tsx`: Thai-first title and one Enter Lab action.
- `src/data/labs.ts`: required `thaiTitle` for all 103 labs.
- `src/app/labs/page.tsx`: remove details navigation from listings.
- `src/components/CategoryFilter.tsx`, `src/components/labs/LabHero.tsx`, `src/components/labs/simulation/SharedSimulationShell.tsx`: Pastel Blush theme sources.
- `supabase/migrations/20260629054000_disable_scoring.sql`: zero-score experiment and mission persistence.
- `tests/product-consolidation.test.mjs`: focused regression coverage.
- `tests/mathematics-theme-ui.test.mjs`: update Mathematics theme expectations.

### Task 1: Lock Requirements with Failing Regression Tests

**Files:**
- Create: `tests/product-consolidation.test.mjs`
- Modify: `tests/mathematics-theme-ui.test.mjs`

- [ ] **Step 1: Write route, navigation, profile, card, and scoring tests**

Create `tests/product-consolidation.test.mjs` with project-file helpers and these assertions:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");

test("Labs replaces Home and legacy History redirects into Profile", () => {
  assert.match(read("src/app/page.tsx"), /redirect\("\/labs"\)/);
  assert.match(read("src/app/history/page.tsx"), /redirect\("\/profile\?tab=history"\)/);

  for (const path of ["src/components/Sidebar.tsx", "src/components/MobileTabBar.tsx"]) {
    const source = read(path);
    assert.match(source, /ห้องแล็บ/);
    assert.match(source, /ภารกิจ/);
    assert.match(source, /โปรไฟล์/);
    assert.doesNotMatch(source, /หน้าหลัก|คะแนนและรางวัล|ประวัติการเรียนรู้|href:\s*"\/history"/);
  }
});

test("Profile owns overview, history, and rewards", () => {
  const profile = read("src/app/profile/page.tsx");
  assert.match(profile, /"overview" \| "history" \| "rewards"/);
  assert.match(profile, /<LearningHistoryPage embedded/);
  assert.match(profile, /ภาพรวมความก้าวหน้า/);
  assert.match(profile, /ประวัติการเรียนรู้/);
  assert.match(profile, /รางวัล/);
});

test("Lab cards are Thai-first and expose only Enter Lab", () => {
  const data = read("src/data/labs.ts");
  const cards = read("src/components/LabCard.tsx");
  const listing = read("src/app/labs/page.tsx");
  assert.equal((data.match(/\bid:\s*"/g) ?? []).length, 103);
  assert.equal((data.match(/\bthaiTitle:\s*"/g) ?? []).length, 103);
  assert.match(cards, /thaiTitle: string/);
  assert.match(cards, /\{lab\.thaiTitle\}[\s\S]*?\{lab\.title\}/);
  assert.doesNotMatch(cards, /รายละเอียด|onViewDetails|<Eye/);
  assert.doesNotMatch(listing, /handleViewDetails|onViewDetails/);
  assert.match(cards, /w-full[\s\S]*?เข้าห้อง/);
});

test("Active application flows contain no scoring system", () => {
  const paths = [
    "src/components/Navbar.tsx",
    "src/app/profile/page.tsx",
    "src/components/history/LearningHistoryPage.tsx",
    "src/app/missions/page.tsx",
    "src/lib/supabase/auth-cache.ts",
    "src/lib/supabase/experiment-sync.ts",
    "src/lib/supabase/missions.ts",
    "src/components/profile/TeacherDashboard.tsx",
    "src/components/profile/TeacherDashboardSection.tsx",
  ];
  for (const path of paths) {
    const source = read(path);
    assert.doesNotMatch(source, /scisiam_points|pointsAwarded|totalPoints|currentLevel/,
      `${path} still exposes point state`);
  }

  assert.match(read("src/lib/supabase/experiment-sync.ts"), /p_score:\s*null/);
  assert.doesNotMatch(read("src/components/profile/TeacherDashboard.tsx"), /score\??:|ให้คะแนน|ตารางคะแนน/);
  assert.doesNotMatch(read("src/components/profile/TeacherDashboardSection.tsx"), /gradeScore|บันทึกคะแนน|ได้คะแนน/);
});
```

- [ ] **Step 2: Change Mathematics expectations to Pastel Blush**

Update `tests/mathematics-theme-ui.test.mjs` so shared chrome expects `pink-50`, `pink-200`, `pink-800/900`, and command buttons expect `bg-pink-200 hover:bg-pink-300 text-pink-900`. Add negative assertions for `rose-600`, `red-600`, and `bg-pink-600` in Mathematics action mappings.

- [ ] **Step 3: Run tests and verify RED**

Run:

```powershell
node --test tests/product-consolidation.test.mjs tests/mathematics-theme-ui.test.mjs
```

Expected: FAIL because routes still render Home/History, navigation has old items, cards lack `thaiTitle`, scoring is active, and Mathematics actions are saturated.

- [ ] **Step 4: Commit regression tests after the first GREEN task, not while RED**

Keep the tests unstaged until Task 2 makes the first group pass.

### Task 2: Replace Home and Consolidate Navigation

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/history/page.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/MobileTabBar.tsx`
- Test: `tests/product-consolidation.test.mjs`

- [ ] **Step 1: Replace Home with a server redirect**

Replace `src/app/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/labs");
}
```

- [ ] **Step 2: Redirect the legacy History route**

Replace `src/app/history/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function HistoryPage() {
  redirect("/profile?tab=history");
}
```

- [ ] **Step 3: Reduce desktop navigation to three destinations**

In `Sidebar.tsx`, remove `Home`, `Award`, and `History` imports, narrow the active-menu union, and use:

```tsx
const sidebarMenu = [
  { name: "ห้องแล็บ", icon: FlaskConical, href: "/labs" },
  { name: "ภารกิจนักวิทย์", icon: ClipboardCheck, href: "/missions" },
  { name: "โปรไฟล์", icon: User, href: "/profile" },
];
```

- [ ] **Step 4: Reduce mobile navigation to three destinations**

In `MobileTabBar.tsx`, remove `Home` and `History`, define only Labs/Missions/Profile, change the grid to `grid-cols-3`, and make `getActiveItem` default to `ห้องแล็บ`.

- [ ] **Step 5: Run focused tests**

Run:

```powershell
node --test tests/product-consolidation.test.mjs
```

Expected: route/navigation test passes; profile, card, and scoring tests still fail.

- [ ] **Step 6: Commit**

```powershell
git add -- src/app/page.tsx src/app/history/page.tsx src/components/Sidebar.tsx src/components/MobileTabBar.tsx tests/product-consolidation.test.mjs
git diff --cached --check
git commit -m "feat: make labs the primary navigation"
```

### Task 3: Add Thai Titles and Simplify Lab Cards

**Files:**
- Modify: `src/components/LabCard.tsx`
- Modify: `src/data/labs.ts`
- Modify: `src/app/labs/page.tsx`
- Test: `tests/product-consolidation.test.mjs`

- [ ] **Step 1: Add a required Thai title**

Add `thaiTitle: string` to `LabData`. Insert one `thaiTitle` after every `title` in `labs.ts` using the exact mapping in Appendix A.

- [ ] **Step 2: Render Thai first and English second**

Replace the title block in `LabCard.tsx` with:

```tsx
<h3 className="line-clamp-1 text-lg font-extrabold leading-[1.45] text-slate-900">
  {lab.thaiTitle}
</h3>
<p className="mt-0.5 line-clamp-1 text-xs font-bold leading-relaxed text-slate-400">
  {lab.title}
</p>
```

Keep the description below the English title.

- [ ] **Step 3: Remove Details behavior and keep one button**

Remove `onViewDetails` from `LabCardProps`, remove the `Eye` import and Details button, and make the action container `mt-auto w-full`. The Enter Lab button must include `w-full` and preserve readiness disabling.

In `src/app/labs/page.tsx`, delete `handleViewDetails` and stop passing `onViewDetails`.

- [ ] **Step 4: Run focused tests**

Run:

```powershell
node --test tests/product-consolidation.test.mjs tests/scisiam-regressions.test.mjs
```

Expected: Thai-title/card test passes and existing lab registry tests remain green.

- [ ] **Step 5: Commit without losing pre-existing edits**

Review the existing `labs.ts` diff before staging. Preserve the user’s three in-progress Mathematics simulations and registry changes.

```powershell
git diff -- src/data/labs.ts
git add -- src/components/LabCard.tsx src/data/labs.ts src/app/labs/page.tsx tests/product-consolidation.test.mjs
git diff --cached --check
git commit -m "feat: simplify lab cards with Thai titles"
```

### Task 4: Apply the Pastel Blush Mathematics Theme

**Files:**
- Modify: `src/components/CategoryFilter.tsx`
- Modify: `src/components/LabCard.tsx`
- Modify: `src/components/labs/LabHero.tsx`
- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx`
- Modify: Mathematics simulation command-button files listed below
- Modify: `tests/mathematics-theme-ui.test.mjs`

- [ ] **Step 1: Replace shared Mathematics theme tokens**

Use these classes for Mathematics chrome:

```ts
const mathematicsPastel = {
  surface: "bg-pink-50",
  surfaceHover: "hover:bg-pink-100",
  border: "border-pink-200",
  button: "bg-pink-200 hover:bg-pink-300 text-pink-900",
  text: "text-pink-900",
  icon: "text-pink-600",
};
```

Inline the values into existing theme maps rather than creating a new exported abstraction.

- [ ] **Step 2: Add a pink shared simulation accent**

Add this `pink` entry to `accentClasses` in `SharedSimulationShell.tsx`:

```ts
pink: {
  icon: "bg-pink-200 text-pink-900",
  border: "border-pink-200",
  soft: "bg-pink-50 text-pink-900 border-pink-200",
  text: "text-pink-800",
  button: "bg-pink-200 hover:bg-pink-300 text-pink-900",
  ring: "#f9a8d4",
},
```

Resolve Mathematics with `const resolvedAccent = category === "Mathematics" ? "pink" : accent;`.

- [ ] **Step 3: Change Mathematics command buttons only**

In these files, replace Mathematics UI command classes `bg-rose-600 hover:bg-rose-700 text-white` with `bg-pink-200 hover:bg-pink-300 text-pink-900`; do not recolor graph series:

```text
AppliedMathSimulation.tsx
CenterVariabilitySimulation.tsx
CurveFittingSimulation.tsx
FunctionBuilderSimulation.tsx
GraphingLinesSimulation.tsx
NormalDistributionSimulation.tsx
ProbabilitySimulation.tsx
RatioProportionSimulation.tsx
TrigonometryWavesSimulation.tsx
VectorAdditionSimulation.tsx
DiscreteGraphTheorySimulation.tsx
MathematicalModelingSimulation.tsx
VectorFieldsGradientsSimulation.tsx
```

- [ ] **Step 4: Run theme tests and lint**

```powershell
node --test tests/mathematics-theme-ui.test.mjs
npx eslint src/components/CategoryFilter.tsx src/components/LabCard.tsx src/components/labs/LabHero.tsx src/components/labs/simulation/SharedSimulationShell.tsx
```

Expected: all Mathematics theme assertions pass and ESLint reports zero errors.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/CategoryFilter.tsx src/components/LabCard.tsx src/components/labs/LabHero.tsx src/components/labs/simulation tests/mathematics-theme-ui.test.mjs
git diff --cached --check
git commit -m "style: apply pastel blush mathematics theme"
```

### Task 5: Move History and Rewards into Profile

**Files:**
- Modify: `src/app/profile/page.tsx`
- Modify: `src/components/history/LearningHistoryPage.tsx`
- Modify: `src/lib/supabase/learning-snapshot.ts`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/lib/supabase/auth-cache.ts`
- Modify: `src/components/auth/AuthForm.tsx`
- Test: `tests/product-consolidation.test.mjs`

- [ ] **Step 1: Remove score fields from learning snapshots**

Use these public snapshot types:

```ts
export type LearningRunSnapshot = {
  id: string;
  labId: string;
  title: string;
  createdAt: string;
};

export type LearningSnapshot = {
  completedCount: number;
  completedLabIds: string[];
  recentRuns: LearningRunSnapshot[];
  profile?: { displayName: string; role: ScisiamUserRole };
};
```

Local snapshots derive only completion and timestamps. Supabase selects only `display_name, role`, `lab_id, status, completed_at, last_activity_at`, and `id, lab_id, title, created_at`.

- [ ] **Step 2: Make authentication cache score-free**

Delete `SCISIAM_POINTS_EVENT`, `totalPoints`, and all `scisiam_points` reads/writes from `auth-cache.ts`. Update AuthForm callers to cache only email, role, and display name.

- [ ] **Step 3: Remove the Navbar point counter**

Delete point state, point-loading effects, `total_points` profile selection, `Sparkles`, and the points-counter JSX. Keep authentication, notifications, settings, and profile controls.

- [ ] **Step 4: Make History embeddable and score-free**

Add:

```ts
type LearningHistoryPageProps = { embedded?: boolean };
export default function LearningHistoryPage({ embedded = false }: LearningHistoryPageProps) {
```

Remove `pointsAwarded` and `score` from `HistoryRecord`, all score/point summary cards and labels, and the points event listener. When `embedded` is true, render only history content; otherwise retain the existing shell for Storybook-like direct rendering even though `/history` redirects.

- [ ] **Step 5: Add the Profile history tab and URL synchronization**

Use:

```ts
type StudentTab = "overview" | "history" | "rewards";
const [activeStudentTab, setActiveStudentTab] = useState<StudentTab>("overview");

const selectStudentTab = (tab: StudentTab) => {
  setActiveStudentTab(tab);
  window.history.replaceState(null, "", tab === "overview" ? "/profile" : `/profile?tab=${tab}`);
};
```

Accept `history` and `rewards` from the query string. Add the third tab button and render `<LearningHistoryPage embedded />` for history.

- [ ] **Step 6: Make rewards milestone-based**

Remove points and level cards. Derive reward status from `completedLabIds`, `recentRuns`, and `loadClaimedMissionIds()`. Keep these reward milestones:

```ts
[
  { id: "first-lab", title: "ก้าวแรกนักทดลอง", unlocked: completedCount >= 1 },
  { id: "five-labs", title: "นักสำรวจห้องแล็บ", unlocked: completedCount >= 5 },
  { id: "ten-labs", title: "นักวิจัยต่อเนื่อง", unlocked: completedCount >= 10 },
  { id: "three-missions", title: "ผู้พิชิตภารกิจ", unlocked: claimedMissionIds.length >= 3 },
]
```

- [ ] **Step 7: Run focused tests and TypeScript lint**

```powershell
node --test tests/product-consolidation.test.mjs
npx eslint src/app/profile/page.tsx src/components/history/LearningHistoryPage.tsx src/components/Navbar.tsx src/lib/supabase/learning-snapshot.ts src/lib/supabase/auth-cache.ts src/components/auth/AuthForm.tsx
```

Expected: profile test passes and ESLint reports zero errors.

- [ ] **Step 8: Commit**

```powershell
git add -- src/app/profile/page.tsx src/components/history/LearningHistoryPage.tsx src/components/Navbar.tsx src/lib/supabase/learning-snapshot.ts src/lib/supabase/auth-cache.ts src/components/auth/AuthForm.tsx tests/product-consolidation.test.mjs
git diff --cached --check
git commit -m "feat: consolidate learning history and rewards"
```

### Task 6: Disable Student Scores and Mission Points at Shared Boundaries

**Files:**
- Modify: `src/lib/supabase/experiment-sync.ts`
- Modify: `src/lib/supabase/missions.ts`
- Modify: `src/app/missions/page.tsx`
- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx`
- Modify: `src/components/labs/simulation/LearningSidebar.tsx`
- Modify: simulation files containing user-facing point copy
- Test: `tests/product-consolidation.test.mjs`

- [ ] **Step 1: Make local experiment saves score-free**

Change `SaveExperimentInput` to contain only `localStorageKey` and `localPayload` beyond the sync input. `saveExperimentLocally` writes the payload, dispatches only `SCISIAM_AUTH_EVENT`, and returns `void`. Delete `localPoints`, `awardedPoints`, and `scisiam_points` logic.

- [ ] **Step 2: Persist null scores centrally**

Keep `score?` temporarily in `SyncExperimentInput` so 61 simulation callers remain source-compatible, but always send:

```ts
p_score: null,
```

Delete the profile `total_points` refresh after the RPC succeeds.

- [ ] **Step 3: Simplify mission claim results**

Use:

```ts
export type ClaimMissionResult =
  | { ok: true; claimed: boolean; alreadyClaimed: boolean }
  | { ok: false; reason: ClaimMissionFailureReason; message?: string };
```

Remove point fields, profile refresh, and auth-cache calls from `missions.ts`.

- [ ] **Step 4: Remove numeric mission rewards from UI**

Remove `rewardPoints`, points/XP/level state, point-collector mission, numeric reward totals, and numeric toast copy. Successful claim copy becomes `บันทึกภารกิจสำเร็จและปลดล็อกรางวัลแล้ว`.

- [ ] **Step 5: Remove simulation score chrome and copy**

Remove `scoreLabel` and its badge from `SharedSimulationShell`. Remove point-award sections from `LearningSidebar`, Boyle, Charles, Ideal Gas, Snell, and other files returned by:

```powershell
rg -l 'scoreLabel|\+25 แต้ม|\+25 คะแนน|คะแนนเมื่อสำเร็จ|คะแนนพิเศษ|รับคะแนน' src/components/labs/simulation -g '*.tsx'
```

Rename `คะแนนความคืบหน้า` to `ความคืบหน้า`. Do not remove scientific percentages or graph values.

- [ ] **Step 6: Run focused tests**

```powershell
node --test tests/product-consolidation.test.mjs tests/scisiam-regressions.test.mjs
npx eslint src/lib/supabase/experiment-sync.ts src/lib/supabase/missions.ts src/app/missions/page.tsx src/components/labs/simulation/SharedSimulationShell.tsx
```

Expected: active scoring regression passes and no lint errors appear.

- [ ] **Step 7: Commit**

```powershell
git add -- src/lib/supabase/experiment-sync.ts src/lib/supabase/missions.ts src/app/missions/page.tsx src/components/labs/simulation tests/product-consolidation.test.mjs
git diff --cached --check
git commit -m "feat: disable student scoring and mission points"
```

### Task 7: Remove Teacher Grading and Score Export

**Files:**
- Modify: `src/components/profile/TeacherDashboard.tsx`
- Modify: `src/components/profile/TeacherDashboardSection.tsx`
- Test: `tests/product-consolidation.test.mjs`

- [ ] **Step 1: Remove numeric score state and types**

Delete `score?: string` from `TeacherSubmission`, `gradeScore`, numeric score inputs, score columns, and score-based activity text.

- [ ] **Step 2: Convert grading to qualitative feedback**

Rename callbacks and labels from grading to review feedback:

```ts
onSendFeedback: (review: TeacherReview) => void;
```

The review modal keeps only `gradeFeedback`, labels it `ความคิดเห็นและคำแนะนำ`, and submits with `ส่งคำแนะนำ`.

- [ ] **Step 3: Remove score spreadsheet export**

Delete the Excel score-table button and its callback branch. A non-scoring PDF progress report may remain. Replace `ตรวจผลการทดลอง ให้คะแนน และส่งคำแนะนำ` with `ตรวจผลการทดลองและส่งคำแนะนำ`.

- [ ] **Step 4: Run focused tests and lint**

```powershell
node --test tests/product-consolidation.test.mjs
npx eslint src/components/profile/TeacherDashboard.tsx src/components/profile/TeacherDashboardSection.tsx
```

Expected: teacher scoring assertions pass and ESLint reports zero errors.

- [ ] **Step 5: Commit**

```powershell
git add -- src/components/profile/TeacherDashboard.tsx src/components/profile/TeacherDashboardSection.tsx tests/product-consolidation.test.mjs
git diff --cached --check
git commit -m "feat: replace teacher grading with feedback"
```

### Task 8: Disable Scoring in Supabase Without Deleting Historical Data

**Files:**
- Create: `supabase/migrations/20260629054000_disable_scoring.sql`
- Modify: `tests/product-consolidation.test.mjs`
- Modify: `tests/scisiam-regressions.test.mjs`

- [ ] **Step 1: Add migration assertions before SQL**

Assert the migration contains `p_score` persistence as `null`, `points_awarded` as `0`, no `total_points = total_points +`, and mission definitions updated to zero rewards.

- [ ] **Step 2: Replace experiment-save internals**

Create a forward migration that keeps the existing signature but inserts `score = null`, `points_awarded = 0`, writes `best_score = null` and `last_score = null` for new progress rows, leaves historical score columns unchanged on conflict, and updates only profile activity timestamps. The profile update must be:

```sql
create or replace function private.save_experiment_run_internal(
  p_lab_id text,
  p_title text default null,
  p_variables jsonb default '{}'::jsonb,
  p_live_values jsonb default '{}'::jsonb,
  p_graph_points jsonb default '[]'::jsonb,
  p_table_rows jsonb default '[]'::jsonb,
  p_prediction jsonb default null,
  p_reflection text default null,
  p_summary jsonb default '{}'::jsonb,
  p_score numeric default null,
  p_duration_seconds integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_run_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if not exists (select 1 from public.labs where id = p_lab_id and is_active) then
    raise exception 'Unknown or inactive lab: %', p_lab_id using errcode = '22023';
  end if;

  insert into public.experiment_runs (
    user_id, lab_id, status, title, variables, live_values, graph_points,
    table_rows, prediction, reflection, summary, score, points_awarded,
    duration_seconds, submitted_at
  ) values (
    v_user_id, p_lab_id, 'submitted'::public.scisiam_submission_status,
    nullif(p_title, ''), coalesce(p_variables, '{}'::jsonb),
    coalesce(p_live_values, '{}'::jsonb), coalesce(p_graph_points, '[]'::jsonb),
    coalesce(p_table_rows, '[]'::jsonb), p_prediction, nullif(p_reflection, ''),
    coalesce(p_summary, '{}'::jsonb), null, 0, p_duration_seconds, now()
  ) returning id into v_run_id;

  insert into public.lab_progress (
    user_id, lab_id, status, progress_percent, attempts_count, best_score,
    last_score, points_awarded, last_run_id, last_activity_at, completed_at
  ) values (
    v_user_id, p_lab_id, 'completed'::public.scisiam_progress_status, 100, 1,
    null, null, 0, v_run_id, now(), now()
  )
  on conflict (user_id, lab_id) do update set
    status = 'completed'::public.scisiam_progress_status,
    progress_percent = 100,
    attempts_count = public.lab_progress.attempts_count + 1,
    last_run_id = excluded.last_run_id,
    last_activity_at = now(),
    completed_at = coalesce(public.lab_progress.completed_at, now()),
    updated_at = now();

  update public.profiles
  set last_active_at = now(), updated_at = now()
  where id = v_user_id;

  return v_run_id;
end;
$$;

revoke all on function private.save_experiment_run_internal(
  text, text, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, numeric, integer
) from public, anon, authenticated;
grant execute on function private.save_experiment_run_internal(
  text, text, jsonb, jsonb, jsonb, jsonb, jsonb, text, jsonb, numeric, integer
) to authenticated;
```

The function must contain no point or XP increment.

- [ ] **Step 3: Replace mission-claim internals**

Keep authentication, mission existence, completion validation, and `user_mission_progress` upsert. Remove the profile points update and return only:

```sql
create or replace function private.claim_mission_reward_internal(p_mission_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_mission public.mission_definitions%rowtype;
  v_existing_claimed_at timestamptz;
  v_progress_count integer;
begin
  if v_user_id is null then
    return jsonb_build_object('ok', false, 'reason', 'signed_out');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text || ':' || p_mission_id, 0)
  );

  select * into v_mission
  from public.mission_definitions
  where id = p_mission_id and is_active = true;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'mission_not_found');
  end if;

  insert into public.profiles (id, role, total_points)
  values (v_user_id, 'student'::public.scisiam_user_role, 0)
  on conflict (id) do nothing;

  v_progress_count := private.calculate_mission_progress(
    v_user_id,
    v_mission.id,
    v_mission.mission_type
  );

  if v_progress_count < v_mission.target_count then
    return jsonb_build_object(
      'ok', false,
      'reason', 'not_completed',
      'target_count', v_mission.target_count,
      'progress_count', v_progress_count
    );
  end if;

  select claimed_at into v_existing_claimed_at
  from public.user_mission_progress
  where user_id = v_user_id and mission_id = p_mission_id
  for update;

  if v_existing_claimed_at is not null then
    return jsonb_build_object(
      'ok', true,
      'claimed', false,
      'already_claimed', true,
      'mission_id', p_mission_id
    );
  end if;

  insert into public.user_mission_progress (
    user_id, mission_id, progress_count, completed_at, claimed_at
  ) values (
    v_user_id, p_mission_id, v_progress_count, now(), now()
  )
  on conflict (user_id, mission_id) do update set
    progress_count = greatest(public.user_mission_progress.progress_count, excluded.progress_count),
    completed_at = coalesce(public.user_mission_progress.completed_at, excluded.completed_at),
    claimed_at = excluded.claimed_at,
    updated_at = now();

  update public.profiles
  set last_active_at = now(), updated_at = now()
  where id = v_user_id;

return jsonb_build_object(
  'ok', true,
  'claimed', true,
  'already_claimed', false,
  'mission_id', p_mission_id
);
end;
$$;

revoke all on function private.claim_mission_reward_internal(text)
  from public, anon, authenticated;
grant execute on function private.claim_mission_reward_internal(text)
  to authenticated;
```

For an existing claim, return the same keys with `claimed = false` and `already_claimed = true`.

- [ ] **Step 4: Deactivate numeric mission rewards**

Add:

```sql
update public.mission_definitions set points_reward = 0;
update public.achievement_definitions
set is_active = false
where criteria_type = 'points_total';
```

- [ ] **Step 5: Run migration regression and full tests**

Append `"20260629054000"` to the exact `expectedVersions` array in `tests/scisiam-regressions.test.mjs`, preserving all earlier deployed versions.

```powershell
node --test tests/product-consolidation.test.mjs tests/scisiam-regressions.test.mjs
```

Expected: migration and local/deployed migration-history checks pass.

- [ ] **Step 6: Commit**

```powershell
git add -- supabase/migrations/20260629054000_disable_scoring.sql tests/product-consolidation.test.mjs tests/scisiam-regressions.test.mjs
git diff --cached --check
git commit -m "feat: disable scoring in persistence flows"
```

- [ ] **Step 7: Apply the forward migration to the linked Supabase project**

Load the `supabase` skill, confirm the linked project, then run:

```powershell
npx supabase migration list
npx supabase db push
npx supabase migration list
```

Expected: `20260629054000` appears in both local and remote migration history. Do not reset, delete, or rewrite historical migrations.

### Task 9: Full Verification, Visual QA, and Knowledge Graph Update

**Files:**
- Update generated local graph only: `graphify-out/` (do not stage)

- [ ] **Step 1: Run full automated verification**

```powershell
npm test
npm run lint
npm run build
```

Expected: tests pass, lint has zero errors, and the Next.js production build succeeds.

- [ ] **Step 2: Scan active source for scoring copy and secrets**

```powershell
rg -n 'scisiam_points|\+\d+\s*(คะแนน|แต้ม)|คะแนนสะสม|ตารางคะแนน|ให้คะแนน' src -g '*.{ts,tsx}'
git grep -Il -E 'AIza[0-9A-Za-z_-]{30,}|sk-proj-[0-9A-Za-z_-]{20,}' -- .
```

Expected: no active gamification/teacher-score UI matches; only domain wording unrelated to the removed scoring system may remain. No tracked API-key-shaped value is found.

- [ ] **Step 3: Inspect desktop and mobile routes**

Capture and inspect at 1440x900 and 390x844:

```text
/labs?category=Mathematics
/profile
/profile?tab=history
/profile?tab=rewards
/missions
/labs/graphing-lines/simulation
```

Verify three-item navigation, Thai-first cards, one Enter Lab action, Pastel Blush contrast, profile tabs, score-free history/rewards, no overlap, and no horizontal overflow.

- [ ] **Step 4: Update graph and verify Git scope**

```powershell
graphify update .
git diff --check
git status --short
git log --oneline --decorate -10
```

Expected: intended source/docs/tests/migration changes only. `.superpowers/`, `graphify-out/`, recovery files, and test logs remain untracked and unstaged.

## Appendix A: Required Thai Lab Titles

```text
newtons-cooling = การเย็นตัวของนิวตัน
ohms-law = กฎของโอห์ม
hookes-law = กฎของฮุค
snells-law = การหักเหของแสง
ideal-gas-law = แก๊สอุดมคติ
newtons-second-law = กฎการเคลื่อนที่ข้อสอง
momentum-conservation = การอนุรักษ์โมเมนตัม
faradays-law = การเหนี่ยวนำแม่เหล็กไฟฟ้า
bernoullis-principle = หลักแบร์นูลลี
photoelectric-effect = ปรากฏการณ์โฟโตอิเล็กทริก
keplers-laws = กฎข้อสามของเคปเลอร์
stefan-boltzmann = การแผ่รังสีวัตถุดำ
push-pull-forces = แรงผลักและแรงดึง
light-and-shadows = แสงและเงา
sound-vibrations = การสั่นของเสียง
simple-circuits = วงจรไฟฟ้าอย่างง่าย
floating-and-sinking = การลอยและการจม
magnet-exploration = สำรวจแม่เหล็ก
acid-base-titration = การไทเทรตกรด-เบส
periodic-table = ตารางธาตุ
boyles-law = กฎของบอยล์
charles-law = กฎของชาร์ลส์
le-chateliers-principle = การเลื่อนสมดุลเคมี
beer-lambert-law = สเปกโทรโฟโตเมตรี
hesss-law = กฎของเฮสส์
galvanic-cell = เซลล์กัลวานิก
chemical-kinetics = อัตราการเกิดปฏิกิริยา
solubility-product = ค่าการละลาย
avogadros-law = ปริมาตรโมลของแก๊ส
electrolysis-lab = อิเล็กโทรลิซิส
colligative-properties = สมบัติคอลลิเกทีฟ
states-of-matter = สถานะของสสาร
mixing-and-separating = การผสมและแยกสาร
dissolving-solutions = การละลายและสารละลาย
acids-bases-around-us = กรด-เบสรอบตัว
heating-cooling-materials = การร้อนและเย็นของวัสดุ
physical-chemical-changes = การเปลี่ยนแปลงกายภาพและเคมี
photosynthesis-rate = อัตราการสังเคราะห์ด้วยแสง
mendels-inheritance = พันธุศาสตร์เมนเดล
mitosis-division = ไมโทซิสและวัฏจักรเซลล์
cell-osmosis = ออสโมซิส
enzyme-kinetics = การทำงานของเอนไซม์
dna-extraction = การสกัดดีเอ็นเอ
cellular-respiration = การหายใจระดับเซลล์
plant-transpiration = การคายน้ำของพืช
natural-selection = การคัดเลือกโดยธรรมชาติ
blood-typing = การตรวจหมู่เลือด
food-chain = โซ่อาหารและนิเวศวิทยา
heart-rate = ระบบหัวใจและหลอดเลือด
graphing-lines = กราฟเส้นตรง
ratio-and-proportion = อัตราส่วนและสัดส่วน
vector-addition = การบวกเวกเตอร์
center-and-variability = ค่ากลางและการกระจาย
curve-fitting = การฟิตเส้นแนวโน้ม
function-builder = สร้างฟังก์ชัน
probability-simulation = ความน่าจะเป็น
trigonometry-waves = ตรีโกณมิติและคลื่น
systems-of-equations = ระบบสมการ
geometry-measurement = การวัดเรขาคณิต
exponential-growth-decay = การเติบโตและสลายตัว
data-sampling-error = ความคลาดเคลื่อนจากการสุ่ม
quadratic-projectiles = ฟังก์ชันกำลังสองและวิถีโพรเจกไทล์
logarithm-scales = ลอการิทึมและสเกลวิทยาศาสตร์
unit-conversion = การแปลงหน่วย
matrix-transformations = การแปลงเมทริกซ์
sequences-series = ลำดับและอนุกรม
inequalities-feasible-regions = อสมการและพื้นที่คำตอบ
transformations-symmetry = การแปลงและสมมาตร
angles-circles = มุมและวงกลม
combinatorics-counting = หลักการนับ
normal-distribution = การแจกแจงปกติ
rates-of-change = อัตราการเปลี่ยนแปลง
optimization-constraints = การหาค่าเหมาะที่สุด
advanced-calculus-optimization = แคลคูลัสขั้นสูง
linear-algebra-eigenvectors = พีชคณิตเชิงเส้น
differential-equations-lab = สมการเชิงอนุพันธ์
numerical-methods-lab = วิธีเชิงตัวเลข
multivariable-calculus = แคลคูลัสหลายตัวแปร
statistical-inference = อนุมานเชิงสถิติ
bayesian-reasoning-lab = การให้เหตุผลแบบเบย์
fourier-analysis-signals = การวิเคราะห์ฟูเรียร์
complex-numbers-phasors = จำนวนเชิงซ้อนและเฟเซอร์
vector-fields-gradients = สนามเวกเตอร์และเกรเดียนต์
discrete-graph-theory = คณิตศาสตร์ไม่ต่อเนื่อง
mathematical-modeling-lab = แบบจำลองทางคณิตศาสตร์
quantum-tunneling = การทะลุผ่านเชิงควอนตัม
michelson-interferometer = อินเตอร์เฟอโรมิเตอร์ไมเคิลสัน
zeeman-effect = ปรากฏการณ์ซีแมน
superconductivity-meissner = สภาพนำยิ่งยวด
bragg-diffraction = การเลี้ยวเบนแบบแบรกก์
relativistic-kinematics = จลนศาสตร์สัมพัทธภาพ
nmr-spectroscopy = สเปกโทรสโกปีเอ็นเอ็มอาร์
xps-spectroscopy = สเปกโทรสโกปีเอ็กซ์พีเอส
hplc-chromatography = โครมาโทกราฟีเอชพีแอลซี
transition-metal-complexes = สารเชิงซ้อนโลหะแทรนซิชัน
eis-electrochemistry = อิมพีแดนซ์ไฟฟ้าเคมี
quantum-chemistry-orbitals = ออร์บิทัลเคมีควอนตัม
pcr-gel-electrophoresis = พีซีอาร์และเจลอิเล็กโทรโฟรีซิส
crispr-gene-editing = การตัดต่อยีนคริสเปอร์
recombinant-dna-transformation = ดีเอ็นเอลูกผสม
flow-cytometry-cycle = โฟลว์ไซโตเมทรี
western-blotting = เวสเทิร์นบลอต
metabolic-pathway-flux = ฟลักซ์เมแทบอลิซึม
```
