# Teacher Dashboard Submission Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic teacher dashboard card grid with a real-data classroom comparison workspace centered on submitted, expected, and pending work.

**Architecture:** Keep `TeacherDashboardSection` as the Supabase orchestration layer and `TeacherDashboard` as the rendering layer. Add one small pure metrics helper so submission calculations are independently testable, then pass the derived values through the existing `TeacherClassroom` view model. No server, schema, query, or dependency changes are required.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Lucide React, Supabase, Node test runner.

## Global Constraints

- Use existing Supabase classroom, member, assignment, and submission data only.
- Do not add mock data, grading, scores, attendance, charts, dependencies, API routes, RPCs, or migrations.
- Keep one primary blue accent and Prompt typography; avoid gradients, dashboard-card mosaics, rankings, and decorative motion.
- Preserve current teacher authorization, retry behavior, and `/classrooms` navigation.
- Support 390px mobile without horizontal page overflow.
- Do not commit or push unless the user explicitly requests it.

---

## File Structure

- Create `src/lib/teacher-dashboard-metrics.ts`: pure submitted/expected/pending/rate calculation.
- Modify `src/components/profile/TeacherDashboardSection.tsx`: map Supabase bundles to the expanded view model and capture refresh time.
- Modify `src/components/profile/TeacherDashboard.tsx`: render compact summary, comparison, follow-up context, states, and responsive layouts.
- Create `tests/teacher-dashboard-metrics.test.mjs`: exercise calculation boundaries.
- Modify `tests/product-consolidation.test.mjs`: protect the approved dashboard structure and data flow.

### Task 1: Submission Metrics

**Files:**
- Create: `src/lib/teacher-dashboard-metrics.ts`
- Create: `tests/teacher-dashboard-metrics.test.mjs`

**Interfaces:**
- Produces: `calculateTeacherSubmissionMetrics(input: { studentCount: number; assignmentCount: number; submissionCount: number }): TeacherSubmissionMetrics`
- Produces: `TeacherSubmissionMetrics` with `submissionCount`, `expectedSubmissionCount`, `pendingSubmissionCount`, and `submissionRate`.

- [ ] **Step 1: Write the failing metrics tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { pathToFileURL } from "node:url";
import path from "node:path";

const moduleUrl = pathToFileURL(path.join(process.cwd(), "src", "lib", "teacher-dashboard-metrics.ts"));
const { calculateTeacherSubmissionMetrics } = await import(moduleUrl.href);

test("teacher dashboard calculates expected, submitted, pending, and rate", () => {
  assert.deepEqual(
    calculateTeacherSubmissionMetrics({ studentCount: 10, assignmentCount: 3, submissionCount: 18 }),
    { submissionCount: 18, expectedSubmissionCount: 30, pendingSubmissionCount: 12, submissionRate: 60 },
  );
});

test("teacher dashboard metrics stay bounded for empty and excessive submission data", () => {
  assert.deepEqual(
    calculateTeacherSubmissionMetrics({ studentCount: 0, assignmentCount: 4, submissionCount: 0 }),
    { submissionCount: 0, expectedSubmissionCount: 0, pendingSubmissionCount: 0, submissionRate: 0 },
  );
  assert.deepEqual(
    calculateTeacherSubmissionMetrics({ studentCount: 2, assignmentCount: 2, submissionCount: 8 }),
    { submissionCount: 8, expectedSubmissionCount: 4, pendingSubmissionCount: 0, submissionRate: 100 },
  );
});
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run: `node --test tests/teacher-dashboard-metrics.test.mjs`

Expected: FAIL because `src/lib/teacher-dashboard-metrics.ts` does not exist.

- [ ] **Step 3: Implement the pure calculation**

```ts
export type TeacherSubmissionMetrics = {
  submissionCount: number;
  expectedSubmissionCount: number;
  pendingSubmissionCount: number;
  submissionRate: number;
};

export function calculateTeacherSubmissionMetrics({
  studentCount,
  assignmentCount,
  submissionCount,
}: {
  studentCount: number;
  assignmentCount: number;
  submissionCount: number;
}): TeacherSubmissionMetrics {
  const safeStudents = Math.max(0, studentCount);
  const safeAssignments = Math.max(0, assignmentCount);
  const safeSubmissions = Math.max(0, submissionCount);
  const expectedSubmissionCount = safeStudents * safeAssignments;

  return {
    submissionCount: safeSubmissions,
    expectedSubmissionCount,
    pendingSubmissionCount: Math.max(0, expectedSubmissionCount - safeSubmissions),
    submissionRate:
      expectedSubmissionCount === 0
        ? 0
        : Math.min(100, Math.round((safeSubmissions / expectedSubmissionCount) * 100)),
  };
}
```

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/teacher-dashboard-metrics.test.mjs`

Expected: 2 tests pass.

### Task 2: Expand the Supabase-backed View Model

**Files:**
- Modify: `src/components/profile/TeacherDashboard.tsx`
- Modify: `src/components/profile/TeacherDashboardSection.tsx`
- Modify: `tests/product-consolidation.test.mjs`

**Interfaces:**
- Consumes: `calculateTeacherSubmissionMetrics` from Task 1.
- Produces: expanded `TeacherClassroom` values `submissionCount`, `expectedSubmissionCount`, `pendingSubmissionCount`.
- Produces: `lastUpdatedAt: string` prop for `TeacherDashboard`.

- [ ] **Step 1: Add failing source-contract assertions**

Add to the existing teacher dashboard test in `tests/product-consolidation.test.mjs`:

```js
assert.match(dashboardSection, /calculateTeacherSubmissionMetrics/);
assert.match(dashboardSection, /submissionCount:/);
assert.match(dashboardSection, /expectedSubmissionCount:/);
assert.match(dashboardSection, /pendingSubmissionCount:/);
assert.match(dashboardSection, /lastUpdatedAt/);
```

- [ ] **Step 2: Run the regression test and verify it fails**

Run: `node --test tests/product-consolidation.test.mjs`

Expected: FAIL on the first missing metrics assertion.

- [ ] **Step 3: Expand the dashboard types and mapping**

Extend `TeacherClassroom`:

```ts
export interface TeacherClassroom {
  id: string;
  name: string;
  gradeLevel: string;
  students: number;
  assignmentCount: number;
  labCount: number;
  submissionCount: number;
  expectedSubmissionCount: number;
  pendingSubmissionCount: number;
  submissionRate: number;
  latestActivity: string;
  href: string;
}
```

Add `lastUpdatedAt: string` to `TeacherDashboardProps`. In `TeacherDashboardSection`, add state and update it only after a successful load:

```ts
const [lastUpdatedAt, setLastUpdatedAt] = useState("");

// After mapping successful bundles:
setLastUpdatedAt(
  new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date()),
);
```

Replace the local rate calculation in `toTeacherClassroom`:

```ts
const metrics = calculateTeacherSubmissionMetrics({
  studentCount,
  assignmentCount: assignments.length,
  submissionCount: submissions.length,
});

return {
  id: classroom.id,
  name: classroom.name,
  gradeLevel: classroom.gradeLevel,
  students: studentCount,
  assignmentCount: assignments.length,
  labCount: classroom.labIds.length,
  ...metrics,
  latestActivity: assignments[0]?.title ?? (classroom.labIds.length > 0 ? `${classroom.labIds.length} แล็บที่เลือกไว้` : "ยังไม่มีงาน"),
  href: `/classrooms/${classroom.id}?tab=classwork`,
};
```

Pass `lastUpdatedAt={lastUpdatedAt}` to `TeacherDashboard`.

- [ ] **Step 4: Run focused tests and TypeScript**

Run: `node --test tests/teacher-dashboard-metrics.test.mjs tests/product-consolidation.test.mjs`

Expected: all focused tests pass.

Run: `npx tsc --noEmit`

Expected: no type errors.

### Task 3: Build the Comparison Workspace

**Files:**
- Modify: `src/components/profile/TeacherDashboard.tsx`
- Modify: `tests/product-consolidation.test.mjs`

**Interfaces:**
- Consumes: expanded `TeacherClassroom`, `TeacherSubmission`, and `lastUpdatedAt` from Task 2.
- Produces: `DashboardSummary`, `ClassroomComparison`, `FollowUpPanel`, and `RecentSubmissionPanel` internal components.

- [ ] **Step 1: Add failing UI structure assertions**

```js
assert.match(dashboard, /ภาพรวมการส่งงาน/);
assert.match(dashboard, /function ClassroomComparison/);
assert.match(dashboard, /<table/);
assert.match(dashboard, /<caption/);
assert.match(dashboard, /scope="col"/);
assert.match(dashboard, /ส่งแล้ว/);
assert.match(dashboard, /ควรส่ง/);
assert.match(dashboard, /ค้างส่ง/);
assert.match(dashboard, /function FollowUpPanel/);
assert.match(dashboard, /ควรติดตาม/);
assert.match(dashboard, /งานส่งล่าสุด/);
assert.doesNotMatch(dashboard, /TEACHER DASHBOARD/);
assert.doesNotMatch(dashboard, /TeacherTab/);
```

- [ ] **Step 2: Run the regression test and verify it fails**

Run: `node --test tests/product-consolidation.test.mjs`

Expected: FAIL because `ClassroomComparison` is not defined.

- [ ] **Step 3: Replace the hero, metric cards, and tabs**

Use this page structure inside `TeacherDashboard`:

```tsx
<div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-10">
  <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-3xl font-bold leading-[1.35] text-slate-950">ภาพรวมการส่งงาน</h1>
      <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
        สวัสดีค่ะ {teacherName} เปรียบเทียบการส่งงานจากห้องเรียนที่คุณดูแล
      </p>
      {lastUpdatedAt ? <p className="mt-1 text-xs font-medium text-slate-500">อัปเดตล่าสุด {lastUpdatedAt}</p> : null}
    </div>
    <Link href="/classrooms" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100">
      จัดการชั้นเรียน
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  </header>

  {status === "loading" ? <DashboardLoading /> : null}
  {status === "error" ? <DashboardError message={errorMessage} onRetry={onRetry} /> : null}
  {status === "ready" ? (
    <div className="mt-6 space-y-6">
      <DashboardSummary classrooms={classrooms} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        <ClassroomComparison classrooms={classrooms} />
        <aside className="grid gap-5" aria-label="ข้อมูลสำหรับติดตาม">
          <FollowUpPanel classrooms={classrooms} />
          <RecentSubmissionPanel submissions={submissions} />
        </aside>
      </div>
    </div>
  ) : null}
</div>
```

Delete `TeacherTab`, `activeTab`, the four-card `metrics` array, the tab navigation, `ClassroomPanel`, and `SubmissionPanel`.

- [ ] **Step 4: Implement the compact aggregate summary**

Derive totals once with `useMemo` and render a flat bordered strip:

```tsx
function DashboardSummary({ classrooms }: { classrooms: TeacherClassroom[] }) {
  const totals = classrooms.reduce(
    (summary, room) => ({
      classrooms: summary.classrooms + 1,
      students: summary.students + room.students,
      submitted: summary.submitted + room.submissionCount,
      expected: summary.expected + room.expectedSubmissionCount,
    }),
    { classrooms: 0, students: 0, submitted: 0, expected: 0 },
  );
  const rate = totals.expected === 0 ? 0 : Math.min(100, Math.round((totals.submitted / totals.expected) * 100));

  return (
    <section className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white sm:grid-cols-2 xl:grid-cols-5" aria-label="สรุปการส่งงานทั้งหมด">
      <SummaryValue label="ห้องเรียน" value={totals.classrooms} />
      <SummaryValue label="นักเรียน" value={totals.students} />
      <SummaryValue label="ส่งแล้ว" value={totals.submitted} />
      <SummaryValue label="ควรส่ง" value={totals.expected} />
      <SummaryValue label="อัตราการส่งรวม" value={`${rate}%`} emphasis />
    </section>
  );
}
```

`SummaryValue` uses dividers instead of individual card shadows.

- [ ] **Step 5: Implement semantic desktop comparison and labeled mobile rows**

Desktop table requirements:

```tsx
<table className="w-full border-collapse">
  <caption className="sr-only">เปรียบเทียบผลการส่งงานของแต่ละห้องเรียน</caption>
  <thead>
    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold text-slate-600">
      <th scope="col" className="px-5 py-3">ห้องเรียน</th>
      <th scope="col" className="px-3 py-3">นักเรียน</th>
      <th scope="col" className="px-3 py-3">งาน</th>
      <th scope="col" className="px-3 py-3">ส่งแล้ว / ควรส่ง</th>
      <th scope="col" className="px-3 py-3">ค้างส่ง</th>
      <th scope="col" className="px-3 py-3">อัตราการส่ง</th>
      <th scope="col" className="px-5 py-3 text-right">จัดการ</th>
    </tr>
  </thead>
</table>
```

Each rate cell includes visible text and a progress element:

```tsx
<div className="min-w-28">
  <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
    <span>{room.submissionRate}%</span>
  </div>
  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`อัตราการส่งงานของ ${room.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={room.submissionRate}>
    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${room.submissionRate}%` }} />
  </div>
</div>
```

Render a separate `md:hidden` list with visible labels and the same `เปิดชั้นเรียน` link so 390px layouts do not require horizontal scrolling.

- [ ] **Step 6: Implement follow-up and recent submission context**

Follow-up selection:

```ts
const roomsToFollow = [...classrooms]
  .filter((room) => room.pendingSubmissionCount > 0)
  .sort((left, right) => right.pendingSubmissionCount - left.pendingSubmissionCount || left.submissionRate - right.submissionRate)
  .slice(0, 3);
```

Each item shows room name plus `ค้าง {pendingSubmissionCount} รายการ · ส่งแล้ว {submissionRate}%`. Recent submissions show at most five existing `TeacherSubmission` records. Both sections use dividers, not nested cards.

- [ ] **Step 7: Align loading and empty states**

Replace four metric skeleton cards with one summary strip, one table skeleton, and one side-column skeleton. Keep `DashboardError` and `EmptyPanel`, but change the empty icon from spinning `Loader2` to `UsersRound` because an empty state is not loading.

- [ ] **Step 8: Run focused tests, lint, and TypeScript**

Run: `node --test tests/teacher-dashboard-metrics.test.mjs tests/product-consolidation.test.mjs`

Expected: all focused tests pass.

Run: `npm run lint`

Expected: no errors or warnings in changed files.

Run: `npx tsc --noEmit`

Expected: no type errors.

### Task 4: Full Verification and Browser QA

**Files:**
- Verify: `src/app/dashboard/page.tsx`
- Verify: `src/components/profile/TeacherDashboard.tsx`
- Verify: `src/components/profile/TeacherDashboardSection.tsx`

**Interfaces:**
- Consumes the finished dashboard and existing teacher-authenticated Supabase session.
- Produces verification evidence only; no additional features.

- [ ] **Step 1: Run the complete regression suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: Next.js production build completes with `/dashboard` generated successfully.

- [ ] **Step 3: Check formatting and update the code graph**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `graphify update .`

Expected: code graph updates successfully.

- [ ] **Step 4: Verify the authenticated dashboard in a browser**

Desktop checks:

- One `ภาพรวมการส่งงาน` heading and one `จัดการชั้นเรียน` action.
- Overall totals equal the visible classroom row totals.
- Comparison table headers align and no dashboard-card mosaic remains.
- Follow-up order follows pending count, then submission rate.
- Classroom and submission links open the matching classroom classwork tab.

Mobile checks around 390px:

- Summary wraps without clipped Thai text.
- Mobile comparison rows show labels and values without horizontal page overflow.
- Links and controls remain at least 44px high.
- Floating AI and mobile navigation do not cover the final classroom action.
