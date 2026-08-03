# Interactive Onboarding and Newton Tutorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** สร้าง Tutorial แบบโต้ตอบสำหรับนักเรียน คุณครู และแล็บ Newton ที่รอการกระทำจริง จำสถานะข้ามอุปกรณ์ และเปิดซ้ำได้จากการตั้งค่า

**Architecture:** ต่อยอด `FirstLoginTour` เป็นตัวประสานและตัวแสดงผลกลาง แล้วแยกคำจำกัดความของแต่ละคู่มือกับสัญญาเหตุการณ์ออกเป็นโมดูลเฉพาะ สถานะปลายทางเก็บในตาราง Supabase ที่มี RLS ส่วนตำแหน่งขั้นระหว่างทำเก็บใน `sessionStorage`; Newton รายงานการเปลี่ยนค่า เริ่ม หยุด และเปิดผลผ่านเหตุการณ์เชิงความหมายโดยไม่สร้างการคลิกแทนผู้ใช้

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase Auth/Postgres/RLS, Node test runner, ระบบ component และ icon เดิมของ SciSiam

## Global Constraints

- ใช้สเปกที่อนุมัติแล้วใน `docs/superpowers/specs/2026-08-03-interactive-onboarding-and-newton-tutorial-design.md`
- คู่มือทั่วไปมี 6 ขั้นต่อบทบาท และคู่มือ Newton มี 7 ขั้น
- ขั้น Newton ต้องรอการเปลี่ยนค่าหรือสถานะจริงก่อนให้ไปต่อ
- ไม่บังคับบันทึกผล สร้างชั้นเรียน ส่งงาน หรือเปลี่ยนค่าการทดลองแทนผู้ใช้
- ไม่เพิ่ม dependency และไม่เปลี่ยน visual language เดิมของ SciSiam
- รองรับเมาส์ สัมผัส คีย์บอร์ด โปรแกรมอ่านหน้าจอ โหมดลดการเคลื่อนไหว และความกว้าง 320, 375, 390, 414 พิกเซล
- รักษา `profiles.onboarding_completed` สำหรับความเข้ากันได้ แต่ใช้ `user_tutorial_progress` เป็นข้อมูลหลักของคู่มือแบบมีเวอร์ชัน
- รักษางานเดิมที่ยังไม่ commit โดยเฉพาะ `src/lib/supabase/database.types.ts`, profile, avatar และ teacher registration; แก้เฉพาะบล็อกที่อยู่ในขอบเขตนี้
- ใช้ migration ใหม่ที่สร้างผ่าน Supabase CLI ห้ามตั้ง timestamp เอง และห้ามแก้ migration เดิม
- ห้าม apply migration ไปฐานข้อมูลระยะไกล ห้าม commit และห้าม push จนกว่าผู้ใช้จะสั่งอย่างชัดเจน
- ทุกคำสั่ง shell ของโครงการใช้ `rtk` นำหน้า

---

## File Map

**Create**

- `src/lib/tutorials/catalog.ts`: ชนิดข้อมูล รหัส เส้นทาง ข้อความ และขั้นตอนของ Tutorial ทั้งสามชุด
- `src/lib/tutorials/events.ts`: สัญญา CustomEvent และตัวตรวจว่าเหตุการณ์ตรงกับขั้นปัจจุบันหรือไม่
- `src/lib/supabase/tutorial-progress.ts`: อ่าน บันทึก และซิงก์สถานะ Tutorial พร้อมคิวออฟไลน์แยกตามผู้ใช้
- `tests/interactive-tutorial.test.mjs`: regression contract ของ catalog, event, progress, overlay และ replay
- `supabase/migrations/`: ตารางและ RLS ในไฟล์ `_add_user_tutorial_progress.sql` ที่ใช้ path จริงจากผลลัพธ์ CLI ใน Task 2

**Modify**

- `src/lib/onboarding-tour.ts`: replay แบบระบุ Tutorial และ session progress
- `src/components/FirstLoginTour.tsx`: ตัวประสาน auto-start/replay, spotlight ที่กดทะลุได้, action gate, retry และ accessibility
- `src/components/SettingsModal.tsx`: ปุ่มเปิดคู่มือทั่วไปกับ Newton แยกกัน
- `src/components/labs/simulation/SharedSimulationShell.tsx`: target ของปุ่มหลัก เหตุการณ์เปิดผล และปุ่มบันทึกในแผงผล
- `src/components/labs/simulation/NewtonsCoolingSimulation.tsx`: target ของอุณหภูมิและรายงานเหตุการณ์จริง
- `src/lib/supabase/database.types.ts`: type ของตารางใหม่ โดยไม่ทับการเปลี่ยนแปลง school/university ที่มีอยู่
- `tests/first-login-tour.test.mjs`: ปรับ regression เดิมให้ตรงกับ engine แบบหลาย Tutorial
- `tests/newtons-cooling-controls.test.mjs`: ตรวจ target และเหตุการณ์ Newton
- `tests/scisiam-regressions.test.mjs`: เพิ่ม version ของ migration ที่ CLI สร้าง

`src/components/GlobalClientOverlays.tsx` ไม่ต้องแก้ เพราะ mount `FirstLoginTour` แบบ global อยู่แล้ว

---

### Task 1: Tutorial Catalog, Event Contract, Replay, and Session State

**Files:**

- Create: `src/lib/tutorials/catalog.ts`
- Create: `src/lib/tutorials/events.ts`
- Modify: `src/lib/onboarding-tour.ts`
- Create: `tests/interactive-tutorial.test.mjs`

**Interfaces:**

- Produces: `TUTORIAL_IDS`, `TutorialId`, `TutorialStep`, `TutorialDefinition`, `getTutorialDefinition()`, `getGeneralTutorialId()`, `getAutoTutorialId()`
- Produces: `reportTutorialAction(detail)` and `matchesTutorialAction(detail, tutorialId, step)`
- Produces: `requestTutorialReplay(tutorialId)`, `peekTutorialReplay()`, `consumeTutorialReplay(tutorialId)`, and session-state helpers
- Consumes: `ScisiamUserRole` from `src/lib/supabase/database.types.ts`

- [ ] **Step 1: Write the failing catalog and event contract tests**

Create `tests/interactive-tutorial.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("tutorial catalog keeps role tours short and Newton action-driven", () => {
  const catalog = read("src/lib/tutorials/catalog.ts");

  assert.match(catalog, /general-student-v2/);
  assert.match(catalog, /general-teacher-v2/);
  assert.match(catalog, /newtons-cooling-v1/);
  assert.match(catalog, /studentSteps[\s\S]*data-tour="lab-search/);
  assert.match(catalog, /teacherSteps[\s\S]*data-tour="teacher-dashboard/);
  assert.match(catalog, /newtonSteps[\s\S]*newton\.initial-temperature\.changed/);
  assert.match(catalog, /newtonSteps[\s\S]*simulation\.started/);
  assert.match(catalog, /newtonSteps[\s\S]*simulation\.paused/);
  assert.match(catalog, /newtonSteps[\s\S]*simulation\.results-opened/);
  assert.match(catalog, /getAutoTutorialId/);
});

test("tutorial action events are scoped by tutorial and lab", () => {
  const events = read("src/lib/tutorials/events.ts");

  assert.match(events, /scisiam:tutorial-action/);
  assert.match(events, /detail\.tutorialId === tutorialId/);
  assert.match(events, /detail\.actionId === step\.actionId/);
  assert.match(events, /detail\.labId === step\.labId/);
  assert.match(events, /CustomEvent<TutorialActionDetail>/);
});

test("tutorial replay stores an exact tutorial id and session progress", () => {
  const source = read("src/lib/onboarding-tour.ts");

  assert.match(source, /requestTutorialReplay\(tutorialId: TutorialId\)/);
  assert.match(source, /peekTutorialReplay/);
  assert.match(source, /consumeTutorialReplay/);
  assert.match(source, /TutorialSessionState/);
  assert.match(source, /completedStepIds/);
  assert.match(source, /sessionStorage/);
});
```

- [ ] **Step 2: Run the test and verify the missing modules fail**

Run:

```powershell
rtk node --test tests/interactive-tutorial.test.mjs
```

Expected: FAIL with `ENOENT` for `src/lib/tutorials/catalog.ts`.

- [ ] **Step 3: Create the typed Tutorial catalog with the approved Thai copy**

Create `src/lib/tutorials/catalog.ts`:

```ts
import type { ScisiamUserRole } from "@/lib/supabase/database.types";

export const TUTORIAL_IDS = {
  studentGeneral: "general-student-v2",
  teacherGeneral: "general-teacher-v2",
  newtonsCooling: "newtons-cooling-v1",
} as const;

export type TutorialId = (typeof TUTORIAL_IDS)[keyof typeof TUTORIAL_IDS];

export type TutorialActionId =
  | "newton.initial-temperature.changed"
  | "newton.ambient-temperature.changed"
  | "simulation.started"
  | "simulation.paused"
  | "simulation.results-opened";

type TutorialStepBase = {
  id: string;
  selector: string;
  title: string;
  description: string;
  tip?: string;
};

export type TutorialStep =
  | (TutorialStepBase & { kind: "info" })
  | (TutorialStepBase & {
      kind: "action";
      actionId: TutorialActionId;
      labId?: string;
    });

export type TutorialDefinition = {
  id: TutorialId;
  label: string;
  eyebrow: string;
  introTitle: string;
  introDescription: string;
  startPath: string;
  audience: readonly ScisiamUserRole[];
  legacyOnboarding: boolean;
  steps: readonly TutorialStep[];
};

const studentSteps: readonly TutorialStep[] = [
  {
    id: "student-search",
    kind: "info",
    selector: '[data-tour="lab-search"]',
    title: "ค้นหาแล็บ",
    description: "พิมพ์ชื่อหรือคำสำคัญเพื่อหาแล็บที่อยากทดลอง",
  },
  {
    id: "student-filter",
    kind: "info",
    selector: '[data-tour="lab-filters"]',
    title: "เลือกวิชาและระดับชั้น",
    description: "ใช้ตัวกรองเพื่อลดรายการให้ตรงกับบทเรียนของคุณ",
  },
  {
    id: "student-enter-lab",
    kind: "info",
    selector: '[data-tour="lab-enter"]',
    title: "เข้าสู่ห้องแล็บ",
    description: "ปุ่มทดลองจะพาไปดูอุปกรณ์ ขั้นตอน และการจำลอง",
  },
  {
    id: "student-classrooms",
    kind: "info",
    selector: '[data-tour="classrooms-nav"]',
    title: "ดูชั้นเรียน",
    description: "เข้าห้องด้วยรหัสเชิญ แล้วดูแล็บและงานที่คุณครูมอบหมาย",
  },
  {
    id: "student-notifications",
    kind: "info",
    selector: '[data-tour="notifications"]',
    title: "ติดตามงานใหม่",
    description: "การแจ้งเตือนจะบอกเมื่อมีงานหรือความเคลื่อนไหวในชั้นเรียน",
  },
  {
    id: "student-profile",
    kind: "info",
    selector: '[data-tour="profile-menu"]',
    title: "โปรไฟล์และการตั้งค่า",
    description: "แก้ข้อมูล ปรับการแสดงผล และเปิดคู่มือนี้ซ้ำได้จากเมนูนี้",
  },
];

const teacherSteps: readonly TutorialStep[] = [
  {
    id: "teacher-overview",
    kind: "info",
    selector: '[data-tour="teacher-dashboard"]',
    title: "ดูภาพรวมการสอน",
    description: "แดชบอร์ดช่วยดูชั้นเรียน งานที่มอบหมาย และการส่งงาน",
  },
  {
    id: "teacher-manage-classrooms",
    kind: "info",
    selector: '[data-tour="teacher-classrooms"]',
    title: "จัดการชั้นเรียน",
    description: "เริ่มสร้างห้อง เลือกแล็บ และรับรหัสเชิญจากจุดนี้",
  },
  {
    id: "teacher-classroom-work",
    kind: "info",
    selector: '[data-tour="classrooms-nav"]',
    title: "มอบหมายและตรวจงาน",
    description: "ภายในชั้นเรียนคุณครูสามารถเพิ่มงาน ดูผลทดลอง และให้คะแนน",
  },
  {
    id: "teacher-labs",
    kind: "info",
    selector: '[data-tour="labs-nav"]',
    title: "สำรวจคลังแล็บ",
    description: "ทดลองแล็บก่อนเลือกไปใช้กับนักเรียนได้จากเมนูนี้",
  },
  {
    id: "teacher-notifications",
    kind: "info",
    selector: '[data-tour="notifications"]',
    title: "ติดตามงานที่ส่ง",
    description: "การแจ้งเตือนช่วยพาไปยังชั้นเรียนและงานที่ต้องตรวจ",
  },
  {
    id: "teacher-profile",
    kind: "info",
    selector: '[data-tour="profile-menu"]',
    title: "โปรไฟล์และการตั้งค่า",
    description: "แก้ข้อมูลบัญชี ปรับหน้าจอ และเปิดคู่มืออีกครั้งได้ที่นี่",
  },
];

const newtonSteps: readonly TutorialStep[] = [
  {
    id: "newton-goal",
    kind: "info",
    selector: '[data-tutorial-lab="newtons-cooling"] [data-testid="simulation-stage-scene"]',
    title: "ดูวัตถุเย็นลง",
    description: "สังเกตว่าอุณหภูมิของวัตถุค่อย ๆ เข้าใกล้อุณหภูมิสิ่งแวดล้อม",
  },
  {
    id: "newton-initial-temperature",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-initial-temperature"]',
    title: "ตั้งอุณหภูมิเริ่มต้น",
    description: "ลองเลื่อนแถบหรือกรอกค่าอุณหภูมิของตัวอย่าง",
    actionId: "newton.initial-temperature.changed",
    labId: "newtons-cooling",
  },
  {
    id: "newton-ambient-temperature",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-ambient-temperature"]',
    title: "ตั้งอุณหภูมิสิ่งแวดล้อม",
    description: "ลองเปลี่ยนอุณหภูมิรอบตัวอย่างเพื่อเปรียบเทียบการเย็นตัว",
    actionId: "newton.ambient-temperature.changed",
    labId: "newtons-cooling",
  },
  {
    id: "newton-start",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-run"]',
    title: "เริ่มทดลอง",
    description: "กดเริ่มทดลอง แล้วดูอุณหภูมิเปลี่ยนแบบทันที",
    actionId: "simulation.started",
    labId: "newtons-cooling",
  },
  {
    id: "newton-pause",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-run"]',
    title: "หยุดชั่วคราว",
    description: "กดหยุดชั่วคราวเพื่อพักการทดลองไว้ที่ค่าปัจจุบัน",
    actionId: "simulation.paused",
    labId: "newtons-cooling",
  },
  {
    id: "newton-results",
    kind: "action",
    selector: '[data-tutorial="newtons-cooling-results"]',
    title: "เปิดผลการทดลอง",
    description: "เปิดผลเพื่อดูค่าปัจจุบัน กราฟ และตารางที่เกิดขึ้นจริง",
    actionId: "simulation.results-opened",
    labId: "newtons-cooling",
  },
  {
    id: "newton-save",
    kind: "info",
    selector: '[data-tutorial="newtons-cooling-results-save"]',
    title: "บันทึกเมื่อพร้อม",
    description: "ปุ่มนี้ใช้เก็บผลไว้ภายหลัง คู่มือนี้จบได้โดยไม่ต้องกดบันทึก",
  },
];

export const tutorialDefinitions: Record<TutorialId, TutorialDefinition> = {
  [TUTORIAL_IDS.studentGeneral]: {
    id: TUTORIAL_IDS.studentGeneral,
    label: "คู่มือเริ่มต้นสำหรับนักเรียน",
    eyebrow: "คู่มือสำหรับนักเรียน",
    introTitle: "เริ่มใช้ SciSiam",
    introDescription: "พาดูจุดสำคัญ 6 ขั้น ใช้เวลาประมาณ 1 นาที",
    startPath: "/labs",
    audience: ["student"],
    legacyOnboarding: true,
    steps: studentSteps,
  },
  [TUTORIAL_IDS.teacherGeneral]: {
    id: TUTORIAL_IDS.teacherGeneral,
    label: "คู่มือเริ่มต้นสำหรับคุณครู",
    eyebrow: "คู่มือสำหรับคุณครู",
    introTitle: "เริ่มจัดการชั้นเรียน",
    introDescription: "พาดูจุดสำคัญสำหรับสอนและตรวจงาน 6 ขั้น",
    startPath: "/dashboard",
    audience: ["teacher"],
    legacyOnboarding: true,
    steps: teacherSteps,
  },
  [TUTORIAL_IDS.newtonsCooling]: {
    id: TUTORIAL_IDS.newtonsCooling,
    label: "คู่มือแล็บ Newton",
    eyebrow: "คู่มือแล็บ Newton",
    introTitle: "ทดลองกฎการเย็นตัวไปพร้อมกัน",
    introDescription: "ปรับค่าจริง เริ่ม หยุด และเปิดผลการทดลองใน 7 ขั้น",
    startPath: "/labs/newtons-cooling/simulation",
    audience: ["student", "teacher"],
    legacyOnboarding: false,
    steps: newtonSteps,
  },
};

export function isTutorialId(value: string): value is TutorialId {
  return Object.prototype.hasOwnProperty.call(tutorialDefinitions, value);
}

export function getTutorialDefinition(tutorialId: TutorialId) {
  return tutorialDefinitions[tutorialId];
}

export function getGeneralTutorialId(role: ScisiamUserRole): TutorialId | null {
  if (role === "student") return TUTORIAL_IDS.studentGeneral;
  if (role === "teacher") return TUTORIAL_IDS.teacherGeneral;
  return null;
}

export function getAutoTutorialId(
  pathname: string,
  role: ScisiamUserRole,
): TutorialId | null {
  const generalId = getGeneralTutorialId(role);
  if (generalId && tutorialDefinitions[generalId].startPath === pathname) return generalId;

  const newton = tutorialDefinitions[TUTORIAL_IDS.newtonsCooling];
  if (newton.startPath === pathname && newton.audience.includes(role)) {
    return newton.id;
  }

  return null;
}
```

- [ ] **Step 4: Create the semantic action event contract**

Create `src/lib/tutorials/events.ts`:

```ts
import type {
  TutorialActionId,
  TutorialId,
  TutorialStep,
} from "@/lib/tutorials/catalog";

export const TUTORIAL_ACTION_EVENT = "scisiam:tutorial-action";

export type TutorialActionDetail = {
  tutorialId: TutorialId;
  actionId: TutorialActionId;
  labId?: string;
};

export function reportTutorialAction(detail: TutorialActionDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<TutorialActionDetail>(TUTORIAL_ACTION_EVENT, { detail }),
  );
}

export function matchesTutorialAction(
  detail: TutorialActionDetail,
  tutorialId: TutorialId,
  step: TutorialStep,
) {
  if (step.kind !== "action") return false;
  if (detail.tutorialId !== tutorialId) return false;
  if (detail.actionId !== step.actionId) return false;
  return step.labId === undefined || detail.labId === step.labId;
}
```

- [ ] **Step 5: Replace replay helpers with typed replay and resilient session state**

Replace `src/lib/onboarding-tour.ts` with:

```ts
import {
  getTutorialDefinition,
  isTutorialId,
  type TutorialId,
} from "@/lib/tutorials/catalog";

export const TUTORIAL_REPLAY_KEY = "scisiam-tutorial-replay";
export const TUTORIAL_REPLAY_EVENT = "scisiam:start-tutorial";
const TUTORIAL_SESSION_PREFIX = "scisiam-tutorial-session";

export type TutorialSessionState = {
  phase: "steps";
  stepIndex: number;
  completedStepIds: string[];
};

export function getTutorialStartPath(tutorialId: TutorialId) {
  return getTutorialDefinition(tutorialId).startPath;
}

export function requestTutorialReplay(tutorialId: TutorialId) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(TUTORIAL_REPLAY_KEY, tutorialId);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(TUTORIAL_REPLAY_EVENT));
}

export function peekTutorialReplay(): TutorialId | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(TUTORIAL_REPLAY_KEY);
    if (!value || !isTutorialId(value)) {
      sessionStorage.removeItem(TUTORIAL_REPLAY_KEY);
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function consumeTutorialReplay(tutorialId: TutorialId) {
  if (peekTutorialReplay() !== tutorialId) return false;
  try {
    sessionStorage.removeItem(TUTORIAL_REPLAY_KEY);
  } catch {
    return false;
  }
  return true;
}

function getTutorialSessionKey(userId: string, tutorialId: TutorialId) {
  return `${TUTORIAL_SESSION_PREFIX}:${userId}:${tutorialId}`;
}

export function readTutorialSession(
  userId: string,
  tutorialId: TutorialId,
): TutorialSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(getTutorialSessionKey(userId, tutorialId));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<TutorialSessionState>;
    if (
      value.phase !== "steps" ||
      !Number.isInteger(value.stepIndex) ||
      !Array.isArray(value.completedStepIds)
    ) {
      return null;
    }
    return {
      phase: "steps",
      stepIndex: Math.max(0, Number(value.stepIndex)),
      completedStepIds: value.completedStepIds.filter(
        (stepId): stepId is string => typeof stepId === "string",
      ),
    };
  } catch {
    return null;
  }
}

export function writeTutorialSession(
  userId: string,
  tutorialId: TutorialId,
  state: TutorialSessionState,
) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      getTutorialSessionKey(userId, tutorialId),
      JSON.stringify(state),
    );
  } catch {
    // Session restoration is a convenience and must not block the tutorial.
  }
}

export function clearTutorialSession(userId: string, tutorialId: TutorialId) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(getTutorialSessionKey(userId, tutorialId));
  } catch {
    // Closing the tutorial must still succeed when browser storage is unavailable.
  }
}
```

- [ ] **Step 6: Run the contract test**

Run:

```powershell
rtk node --test tests/interactive-tutorial.test.mjs
```

Expected: PASS for all three tests.

- [ ] **Step 7: Review only the Task 1 diff**

Run:

```powershell
rtk git diff -- src/lib/tutorials/catalog.ts src/lib/tutorials/events.ts src/lib/onboarding-tour.ts tests/interactive-tutorial.test.mjs
```

Expected: only the catalog, event contract, typed replay/session helper, and their tests. Do not stage or commit.

---

### Task 2: Supabase Tutorial Progress with Per-User RLS and Offline Retry

**Files:**

- Create via CLI: the exact path ending in `_add_user_tutorial_progress.sql` printed by `supabase migration new`
- Create: `src/lib/supabase/tutorial-progress.ts`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `tests/interactive-tutorial.test.mjs`
- Modify: `tests/scisiam-regressions.test.mjs`

**Interfaces:**

- Consumes: `TutorialDefinition`, `TutorialId`
- Produces: `TutorialProgressStatus`, `loadTutorialStatus()`, `persistTutorialStatus()`, `flushPendingTutorialProgress()`
- Database contract: primary key `(user_id, tutorial_id)`, terminal status `completed | skipped`, self-only SELECT/INSERT/UPDATE

- [ ] **Step 1: Add failing persistence and RLS regression tests**

Append to `tests/interactive-tutorial.test.mjs`:

```js
import { readdirSync } from "node:fs";
import { join } from "node:path";

test("tutorial progress is versioned, self-owned, and RLS protected", () => {
  const migrations = join(process.cwd(), "supabase", "migrations");
  const files = readdirSync(migrations).filter((file) =>
    file.endsWith("_add_user_tutorial_progress.sql"),
  );

  assert.equal(files.length, 1);
  const sql = read(`supabase/migrations/${files[0]}`);
  assert.match(sql, /create table public\.user_tutorial_progress/i);
  assert.match(sql, /primary key \(user_id, tutorial_id\)/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /to authenticated/i);
  assert.match(sql, /\(select auth\.uid\(\)\) = user_id/i);
  assert.match(sql, /with check/i);
  assert.match(sql, /grant select, insert, update/i);
  assert.match(sql, /from public\.profiles/i);
  assert.match(sql, /general-student-v2/);
  assert.match(sql, /general-teacher-v2/);
  assert.doesNotMatch(sql, /to anon/i);
});

test("tutorial progress helper keeps failed writes per user for retry", () => {
  const source = read("src/lib/supabase/tutorial-progress.ts");

  assert.match(source, /user_tutorial_progress/);
  assert.match(source, /onConflict: "user_id,tutorial_id"/);
  assert.match(source, /scisiam-tutorial-pending/);
  assert.match(source, /flushPendingTutorialProgress/);
  assert.match(source, /onboarding_completed: true/);
  assert.match(source, /\.eq\("user_id", userId\)/);
});

test("database types expose tutorial progress without replacing profile fields", () => {
  const types = read("src/lib/supabase/database.types.ts");

  assert.match(types, /user_tutorial_progress:/);
  assert.match(types, /status: "completed" \| "skipped"/);
  assert.match(types, /institution_type: "school" \| "university"/);
  assert.match(types, /onboarding_completed: boolean/);
});
```

- [ ] **Step 2: Run the test and verify the missing migration fails**

Run:

```powershell
rtk node --test tests/interactive-tutorial.test.mjs
```

Expected: FAIL because no file ends with `_add_user_tutorial_progress.sql`.

- [ ] **Step 3: Generate the migration through the CLI and fill it with the reviewed SQL**

Run:

```powershell
rtk supabase migration new add_user_tutorial_progress
```

Expected: one new empty file whose suffix is `_add_user_tutorial_progress.sql`. Put this exact SQL in the path printed by the CLI:

```sql
create table public.user_tutorial_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  tutorial_id text not null check (char_length(tutorial_id) between 1 and 100),
  status text not null check (status in ('completed', 'skipped')),
  completed_at timestamptz,
  skipped_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, tutorial_id),
  check (
    (status = 'completed' and completed_at is not null and skipped_at is null)
    or
    (status = 'skipped' and skipped_at is not null and completed_at is null)
  )
);

comment on table public.user_tutorial_progress is
  'Versioned terminal state for each authenticated user tutorial.';

insert into public.user_tutorial_progress (
  user_id,
  tutorial_id,
  status,
  completed_at,
  skipped_at,
  created_at,
  updated_at
)
select
  profiles.id,
  case profiles.role
    when 'teacher' then 'general-teacher-v2'
    else 'general-student-v2'
  end,
  'completed',
  now(),
  null,
  now(),
  now()
from public.profiles
where profiles.onboarding_completed = true
  and profiles.role in ('student', 'teacher')
on conflict (user_id, tutorial_id) do nothing;

create trigger user_tutorial_progress_set_updated_at
before update on public.user_tutorial_progress
for each row execute function public.set_updated_at();

alter table public.user_tutorial_progress enable row level security;

revoke all on table public.user_tutorial_progress from anon;
revoke all on table public.user_tutorial_progress from authenticated;
grant select, insert, update on table public.user_tutorial_progress to authenticated;

create policy "Users can read own tutorial progress"
on public.user_tutorial_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create own tutorial progress"
on public.user_tutorial_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own tutorial progress"
on public.user_tutorial_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

- [ ] **Step 4: Add the generated table types without overwriting dirty profile or institution edits**

Insert this table block next to `profiles` in `src/lib/supabase/database.types.ts`:

```ts
      user_tutorial_progress: {
        Row: {
          user_id: string;
          tutorial_id: string;
          status: "completed" | "skipped";
          completed_at: string | null;
          skipped_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          tutorial_id: string;
          status: "completed" | "skipped";
          completed_at?: string | null;
          skipped_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: "completed" | "skipped";
          completed_at?: string | null;
          skipped_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
```

- [ ] **Step 5: Implement the progress reader, writer, and per-user retry queue**

Create `src/lib/supabase/tutorial-progress.ts`:

```ts
import {
  isTutorialId,
  type TutorialDefinition,
  type TutorialId,
} from "@/lib/tutorials/catalog";
import { createClient } from "@/lib/supabase/client";

export type TutorialProgressStatus = "completed" | "skipped";

type PendingTutorialProgress = {
  tutorialId: TutorialId;
  status: TutorialProgressStatus;
  markLegacyOnboarding: boolean;
};

const PENDING_TUTORIAL_PREFIX = "scisiam-tutorial-pending";

function getPendingKey(userId: string) {
  return `${PENDING_TUTORIAL_PREFIX}:${userId}`;
}

function readPending(userId: string): Record<string, PendingTutorialProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(getPendingKey(userId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Partial<PendingTutorialProgress>>;
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, PendingTutorialProgress] => {
          const [tutorialId, value] = entry;
          return (
            isTutorialId(tutorialId) &&
            value.tutorialId === tutorialId &&
            (value.status === "completed" || value.status === "skipped") &&
            typeof value.markLegacyOnboarding === "boolean"
          );
        },
      ),
    );
  } catch {
    return {};
  }
}

function writePending(
  userId: string,
  pending: Record<string, PendingTutorialProgress>,
) {
  if (typeof window === "undefined") return;
  try {
    const key = getPendingKey(userId);
    if (Object.keys(pending).length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(pending));
  } catch {
    // Tutorial completion must not block access when storage is unavailable.
  }
}

async function writeTutorialStatus(
  userId: string,
  input: PendingTutorialProgress,
) {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { error } = await supabase.from("user_tutorial_progress").upsert(
    {
      user_id: userId,
      tutorial_id: input.tutorialId,
      status: input.status,
      completed_at: input.status === "completed" ? now : null,
      skipped_at: input.status === "skipped" ? now : null,
      updated_at: now,
    },
    { onConflict: "user_id,tutorial_id" },
  );
  if (error) throw error;

  if (input.markLegacyOnboarding) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("id", userId);
    if (profileError) throw profileError;
  }
}

export async function loadTutorialStatus(
  userId: string,
  definition: TutorialDefinition,
): Promise<TutorialProgressStatus | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_tutorial_progress")
    .select("status")
    .eq("user_id", userId)
    .eq("tutorial_id", definition.id)
    .maybeSingle();
  if (error) throw error;
  if (data?.status === "completed" || data?.status === "skipped") {
    return data.status;
  }
  return null;
}

export async function persistTutorialStatus(
  userId: string,
  definition: TutorialDefinition,
  status: TutorialProgressStatus,
) {
  const input: PendingTutorialProgress = {
    tutorialId: definition.id,
    status,
    markLegacyOnboarding: definition.legacyOnboarding,
  };

  try {
    await writeTutorialStatus(userId, input);
    const pending = readPending(userId);
    delete pending[definition.id];
    writePending(userId, pending);
    return true;
  } catch {
    const pending = readPending(userId);
    pending[definition.id] = input;
    writePending(userId, pending);
    return false;
  }
}

export async function flushPendingTutorialProgress(userId: string) {
  const pending = readPending(userId);
  for (const [tutorialId, input] of Object.entries(pending)) {
    try {
      await writeTutorialStatus(userId, input);
      delete pending[tutorialId];
      writePending(userId, pending);
    } catch {
      return;
    }
  }
}
```

- [ ] **Step 6: Add the CLI-generated migration version to the history guard**

Read the 14-digit prefix from the path printed in Step 3. Insert that exact value after `"20260803095321"` in `expectedVersions` inside `tests/scisiam-regressions.test.mjs`. Do not reorder or remove the three existing 3 August migrations.

- [ ] **Step 7: Run persistence and migration regression tests**

Run:

```powershell
rtk node --test tests/interactive-tutorial.test.mjs tests/scisiam-regressions.test.mjs
```

Expected: PASS. The history test must list the CLI-generated migration exactly once.

- [ ] **Step 8: Verify migration discovery without applying remote state**

Run:

```powershell
rtk supabase migration list --local
```

Expected: the new local migration appears. If no local Supabase stack is running, record that limitation and continue with the SQL regression tests; do not run a remote migration push.

- [ ] **Step 9: Review only the Task 2 diff**

Run:

```powershell
rtk git diff -- src/lib/supabase/tutorial-progress.ts src/lib/supabase/database.types.ts supabase/migrations tests/interactive-tutorial.test.mjs tests/scisiam-regressions.test.mjs
```

Expected: the table helper, one CLI-generated migration, the additive database type block, and regression updates. Do not stage or commit.

---

### Task 3: Multi-Tutorial Coordinator and Action-Aware Spotlight

**Files:**

- Modify: `src/components/FirstLoginTour.tsx`
- Modify: `tests/first-login-tour.test.mjs`
- Modify: `tests/interactive-tutorial.test.mjs`

**Interfaces:**

- Consumes: catalog, replay/session helpers, progress helpers, `TUTORIAL_ACTION_EVENT`, `matchesTutorialAction()`
- Produces: global invite and step UI, action gate, click-through spotlight, missing-target recovery, completion/skip persistence
- Preserves: existing `getTourPanelPosition()`, visible-target lookup, scrolling, resize handling, `scisiamTourOpen`, and mobile chrome behavior

- [ ] **Step 1: Read the UI craft floor before touching the overlay**

Run:

```powershell
rtk cmd /c type C:\Users\HP\.agents\skills\impeccable\reference\craft-floor.md
```

Apply its focus, interaction, responsive, and feedback requirements while retaining SciSiam's existing visual system.

- [ ] **Step 2: Update the existing tests so the old passive Dialog implementation fails**

Replace the first test in `tests/first-login-tour.test.mjs` with:

```js
test("first-login tour coordinates versioned progress and real actions", () => {
  const source = read("src/components/FirstLoginTour.tsx");

  assert.match(source, /getAutoTutorialId/);
  assert.match(source, /loadTutorialStatus/);
  assert.match(source, /persistTutorialStatus/);
  assert.match(source, /flushPendingTutorialProgress/);
  assert.match(source, /TUTORIAL_ACTION_EVENT/);
  assert.match(source, /matchesTutorialAction/);
  assert.match(source, /completedStepIds/);
  assert.match(source, /createPortal/);
  assert.match(source, /aria-modal="false"/);
  assert.match(source, /pointer-events-auto/);
  assert.match(source, /ลองใหม่/);
  assert.match(source, /ข้ามขั้นนี้/);
  assert.match(source, /scisiamTourOpen/);
  assert.match(source, /motion-reduce:animate-none/);
  assert.doesNotMatch(source, /<Dialog/);
});
```

Replace the replay test in the same file with:

```js
test("settings and the coordinator replay an exact tutorial", () => {
  const settings = read("src/components/SettingsModal.tsx");
  const replay = read("src/lib/onboarding-tour.ts");
  const tour = read("src/components/FirstLoginTour.tsx");

  assert.match(settings, /requestTutorialReplay/);
  assert.match(replay, /requestTutorialReplay\(tutorialId: TutorialId\)/);
  assert.match(tour, /peekTutorialReplay/);
  assert.match(tour, /consumeTutorialReplay/);
});
```

Append to `tests/interactive-tutorial.test.mjs`:

```js
test("action steps hide forward progress until the semantic event succeeds", () => {
  const source = read("src/components/FirstLoginTour.tsx");

  assert.match(source, /const actionSatisfied =/);
  assert.match(source, /step\.kind === "info" \|\| actionSatisfied/);
  assert.match(source, /ลองทำที่จุดที่ไฮไลต์/);
  assert.match(source, /ทำสำเร็จแล้ว/);
  assert.match(source, /writeTutorialSession/);
  assert.match(source, /clearTutorialSession/);
});
```

- [ ] **Step 3: Run the focused tests and verify they fail against the passive tour**

Run:

```powershell
rtk node --test tests/first-login-tour.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: FAIL because `FirstLoginTour.tsx` still imports Radix Dialog and lacks the action/progress coordinator.

- [ ] **Step 4: Replace inline role steps and Dialog imports with shared contracts**

In `src/components/FirstLoginTour.tsx`:

- Keep `TargetRect`, `PanelPosition`, `getTourPanelPosition()`, `getVisibleTarget()`, and `getTargetRect()` unchanged.
- Delete the local `TourStep`, `studentSteps`, and `teacherSteps` declarations.
- Remove all imports from `@/components/ui/dialog`.
- Use these imports:

```ts
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { ArrowDown, ArrowUp, Check, ChevronLeft, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  getAutoTutorialId,
  getTutorialDefinition,
  type TutorialId,
} from "@/lib/tutorials/catalog";
import {
  matchesTutorialAction,
  TUTORIAL_ACTION_EVENT,
  type TutorialActionDetail,
} from "@/lib/tutorials/events";
import {
  clearTutorialSession,
  consumeTutorialReplay,
  peekTutorialReplay,
  readTutorialSession,
  TUTORIAL_REPLAY_EVENT,
  writeTutorialSession,
} from "@/lib/onboarding-tour";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ScisiamUserRole } from "@/lib/supabase/database.types";
import {
  flushPendingTutorialProgress,
  loadTutorialStatus,
  persistTutorialStatus,
  type TutorialProgressStatus,
} from "@/lib/supabase/tutorial-progress";
```

- [ ] **Step 5: Add a four-sided scrim that blocks the rest of the page but leaves the target usable**

Add before `FirstLoginTour`:

```tsx
function TourScrim({ targetRect }: { targetRect: TargetRect | null }) {
  const blockerClass = "pointer-events-auto fixed z-[110] bg-slate-950/45";

  if (!targetRect) {
    return <div aria-hidden="true" className={`${blockerClass} inset-0`} />;
  }

  const right = targetRect.left + targetRect.width;
  const bottom = targetRect.top + targetRect.height;

  return (
    <>
      <div aria-hidden="true" className={blockerClass} style={{ inset: `0 0 auto 0`, height: targetRect.top }} />
      <div aria-hidden="true" className={blockerClass} style={{ left: 0, top: targetRect.top, width: targetRect.left, height: targetRect.height }} />
      <div aria-hidden="true" className={blockerClass} style={{ left: right, right: 0, top: targetRect.top, height: targetRect.height }} />
      <div aria-hidden="true" className={blockerClass} style={{ inset: `${bottom}px 0 0 0` }} />
    </>
  );
}
```

The root portal must use `pointer-events-none`; only the four blockers and instruction panel use `pointer-events-auto`. This allows pointer, touch, and keyboard interaction with the highlighted control without exposing unrelated controls.

- [ ] **Step 6: Implement auto-start, exact replay, session restore, and terminal persistence**

Use these state fields and coordinator callbacks inside `FirstLoginTour`:

```ts
type TourPhase = "invite" | "steps";

const pathname = usePathname();
const panelRef = useRef<HTMLElement>(null);
const isOpenRef = useRef(false);
const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
const [isOpen, setIsOpen] = useState(false);
const [isReplay, setIsReplay] = useState(false);
const [activeTutorialId, setActiveTutorialId] = useState<TutorialId | null>(null);
const [activeUserId, setActiveUserId] = useState<string | null>(null);
const [phase, setPhase] = useState<TourPhase>("invite");
const [stepIndex, setStepIndex] = useState(0);
const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(new Set());
const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
const [targetMissing, setTargetMissing] = useState(false);
const [retryToken, setRetryToken] = useState(0);
const [panelPosition, setPanelPosition] = useState<PanelPosition>({
  top: 16,
  left: 16,
  maxHeight: "calc(100vh - 2rem)",
});

const definition = activeTutorialId
  ? getTutorialDefinition(activeTutorialId)
  : null;
const steps = definition?.steps ?? [];
const step = phase === "steps" ? steps[stepIndex] ?? null : null;
const actionSatisfied = Boolean(step && completedStepIds.has(step.id));

useEffect(() => {
  setPortalTarget(document.body);
}, []);

const openTutorial = useCallback((
  tutorialId: TutorialId,
  userId: string,
  replay: boolean,
) => {
  const nextDefinition = getTutorialDefinition(tutorialId);
  if (nextDefinition.startPath !== pathname) return;

  const restored = replay ? null : readTutorialSession(userId, tutorialId);
  const safeIndex = Math.min(
    Math.max(0, restored?.stepIndex ?? 0),
    nextDefinition.steps.length - 1,
  );
  setActiveTutorialId(tutorialId);
  setActiveUserId(userId);
  setIsReplay(replay);
  setPhase(restored ? "steps" : "invite");
  setStepIndex(safeIndex);
  setCompletedStepIds(new Set(restored?.completedStepIds ?? []));
  setTargetMissing(false);
  isOpenRef.current = true;
  setIsOpen(true);
}, [pathname]);

useEffect(() => {
  if (!isSupabaseConfigured()) return;
  let cancelled = false;

  const tryOpenTutorial = async () => {
    if (isOpenRef.current) return;
    const replayId = peekTutorialReplay();
    if (replayId) {
      const replayDefinition = getTutorialDefinition(replayId);
      if (replayDefinition.startPath !== pathname) return;
      if (!replayDefinition.audience.includes(role)) return;
    }

    const tutorialId = replayId ?? getAutoTutorialId(pathname, role);
    if (!tutorialId) return;
    const nextDefinition = getTutorialDefinition(tutorialId);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      await flushPendingTutorialProgress(user.id);

      if (replayId) {
        if (!consumeTutorialReplay(replayId) || cancelled) return;
        openTutorial(replayId, user.id, true);
        return;
      }

      const status = await loadTutorialStatus(user.id, nextDefinition);
      if (!cancelled && status === null) {
        openTutorial(tutorialId, user.id, false);
      }
    } catch {
      // Tutorial loading must never block the current page.
    }
  };

  const handleReplay = () => void tryOpenTutorial();
  void tryOpenTutorial();
  window.addEventListener(TUTORIAL_REPLAY_EVENT, handleReplay);
  return () => {
    cancelled = true;
    window.removeEventListener(TUTORIAL_REPLAY_EVENT, handleReplay);
  };
}, [openTutorial, pathname, role]);
```

Add terminal handling. A manual replay that is skipped must not overwrite a previous completion; completing a replay may upgrade `skipped` to `completed`:

```ts
const closeTutorial = useCallback(async (status: TutorialProgressStatus) => {
  const closingDefinition = definition;
  const userId = activeUserId;
  isOpenRef.current = false;
  setIsOpen(false);
  setActiveTutorialId(null);
  if (!closingDefinition || !userId) return;

  clearTutorialSession(userId, closingDefinition.id);
  if (!isReplay || status === "completed") {
    await persistTutorialStatus(userId, closingDefinition, status);
  }
}, [activeUserId, definition, isReplay]);

const writeCurrentSession = useCallback((
  nextIndex: number,
  completedIds: Set<string>,
) => {
  if (!definition || !activeUserId) return;
  writeTutorialSession(activeUserId, definition.id, {
    phase: "steps",
    stepIndex: nextIndex,
    completedStepIds: [...completedIds],
  });
}, [activeUserId, definition]);

const startSteps = () => {
  setPhase("steps");
  setStepIndex(0);
  writeCurrentSession(0, completedStepIds);
};

const goNext = () => {
  if (!definition || !step) return;
  if (stepIndex === definition.steps.length - 1) {
    void closeTutorial("completed");
    return;
  }
  const nextIndex = stepIndex + 1;
  setStepIndex(nextIndex);
  setTargetMissing(false);
  writeCurrentSession(nextIndex, completedStepIds);
};

const goBack = () => {
  const nextIndex = Math.max(0, stepIndex - 1);
  setStepIndex(nextIndex);
  setTargetMissing(false);
  writeCurrentSession(nextIndex, completedStepIds);
};
```

- [ ] **Step 7: Gate action steps on the semantic event and keep completed actions complete when going back**

Add this effect:

```ts
useEffect(() => {
  if (!isOpen || phase !== "steps" || !definition || !step) return;

  const handleTutorialAction = (event: Event) => {
    const detail = (event as CustomEvent<TutorialActionDetail>).detail;
    if (!detail || !matchesTutorialAction(detail, definition.id, step)) return;

    setCompletedStepIds((current) => {
      const next = new Set(current);
      next.add(step.id);
      writeCurrentSession(stepIndex, next);
      return next;
    });
  };

  window.addEventListener(TUTORIAL_ACTION_EVENT, handleTutorialAction);
  return () => window.removeEventListener(TUTORIAL_ACTION_EVENT, handleTutorialAction);
}, [definition, isOpen, phase, step, stepIndex, writeCurrentSession]);
```

Do not synthesize a click, input, or state change. `ถัดไป` is rendered only when `step.kind === "info" || actionSatisfied`; before that render the status `ลองทำที่จุดที่ไฮไลต์`.

- [ ] **Step 8: Add bounded target polling, retry, resize, and route cleanup**

Replace the existing target effect with a bounded 1.6-second lookup that updates on scroll and resize:

```ts
useEffect(() => {
  if (!isOpen || phase !== "steps" || !step) {
    setTargetRect(null);
    setTargetMissing(false);
    return;
  }

  let disposed = false;
  let timer = 0;
  const deadline = Date.now() + 1600;
  const reduceMotion = document.documentElement.dataset.scisiamReduceMotion === "true";

  const locate = () => {
    if (disposed) return;
    const target = getVisibleTarget(step.selector);
    if (target) {
      const rect = target.getBoundingClientRect();
      const needsScroll = rect.top < 84 || rect.bottom > window.innerHeight - 210;
      if (needsScroll && window.getComputedStyle(target).position !== "fixed") {
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "center",
          inline: "nearest",
        });
      }
      setTargetRect(getTargetRect(target));
      setTargetMissing(false);
      if (step.kind === "action") {
        const interactiveTarget = target.matches(
          "button, input, select, textarea, a[href], [tabindex]",
        )
          ? target
          : target.querySelector<HTMLElement>(
              "button, input, select, textarea, a[href], [tabindex]",
            );
        interactiveTarget?.focus({ preventScroll: true });
      }
      return;
    }

    setTargetRect(null);
    if (Date.now() >= deadline) {
      setTargetMissing(true);
      return;
    }
    timer = window.setTimeout(locate, 100);
  };

  const updatePosition = () => {
    const target = getVisibleTarget(step.selector);
    setTargetRect(getTargetRect(target));
  };

  locate();
  window.addEventListener("resize", updatePosition);
  window.addEventListener("scroll", updatePosition, true);
  return () => {
    disposed = true;
    window.clearTimeout(timer);
    window.removeEventListener("resize", updatePosition);
    window.removeEventListener("scroll", updatePosition, true);
  };
}, [isOpen, phase, retryToken, step]);
```

When `pathname !== definition.startPath`, close the overlay without clearing the session or writing a terminal status. Add these effects so returning to the start route resumes the same step while Escape and Tab stay predictable:

```ts
useEffect(() => {
  if (!isOpen || !definition || pathname === definition.startPath) return;
  isOpenRef.current = false;
  setIsOpen(false);
  setActiveTutorialId(null);
}, [definition, isOpen, pathname]);

useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      void closeTutorial("skipped");
      return;
    }
    if (event.key !== "Tab") return;

    const focusableSelector =
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';
    const target = phase === "steps" && step
      ? getVisibleTarget(step.selector)
      : null;
    const targetFocusable = target
      ? target.matches(focusableSelector)
        ? [target]
        : [...target.querySelectorAll<HTMLElement>(focusableSelector)]
      : [];
    const panelFocusable = panelRef.current
      ? [...panelRef.current.querySelectorAll<HTMLElement>(focusableSelector)]
      : [];
    const allowed = [...targetFocusable, ...panelFocusable];
    if (allowed.length === 0) return;

    const currentIndex = allowed.indexOf(document.activeElement as HTMLElement);
    if (currentIndex === -1) {
      event.preventDefault();
      (event.shiftKey ? allowed[allowed.length - 1] : allowed[0]).focus();
    } else if (!event.shiftKey && currentIndex === allowed.length - 1) {
      event.preventDefault();
      allowed[0].focus();
    } else if (event.shiftKey && currentIndex === 0) {
      event.preventDefault();
      allowed[allowed.length - 1].focus();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [closeTutorial, isOpen, phase, step]);
```

Keep the existing `scisiamTourOpen` dataset effect.

After the target effect, focus the instruction panel for the invite, informational steps, and completed actions so screen-reader and keyboard users can reach the next action immediately:

```ts
useEffect(() => {
  if (!isOpen) return;
  if (phase === "steps" && step?.kind === "action" && !actionSatisfied) return;
  const frame = requestAnimationFrame(() => panelRef.current?.focus());
  return () => cancelAnimationFrame(frame);
}, [actionSatisfied, isOpen, phase, step]);
```

- [ ] **Step 9: Render the invite and step panel through a non-modal portal**

Replace the Radix `Dialog` return with a `createPortal` root that follows this contract:

```tsx
if (!portalTarget || !isOpen || !definition) return null;

const arrowBelowTarget = targetRect
  ? targetRect.top + targetRect.height < window.innerHeight * 0.62
  : true;
const arrowLeft = targetRect
  ? Math.min(window.innerWidth - 42, Math.max(12, targetRect.left + targetRect.width / 2 - 14))
  : 0;
const arrowTop = targetRect
  ? arrowBelowTarget
    ? Math.min(window.innerHeight - 52, targetRect.top + targetRect.height + 8)
    : Math.max(8, targetRect.top - 35)
  : 0;
const TargetArrow = arrowBelowTarget ? ArrowUp : ArrowDown;

return createPortal(
  <div className="pointer-events-none fixed inset-0 z-[110]">
    <TourScrim targetRect={phase === "steps" ? targetRect : null} />

    {phase === "steps" && targetRect ? (
      <>
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[120] rounded-2xl border-2 border-blue-500 shadow-[0_0_0_4px_rgba(255,255,255,0.8)] transition-all duration-300 motion-reduce:transition-none"
          style={targetRect}
        />
        <TargetArrow
          aria-hidden="true"
          className="pointer-events-none fixed z-[120] size-7 animate-bounce text-blue-600 motion-reduce:animate-none"
          style={{ left: arrowLeft, top: arrowTop }}
        />
      </>
    ) : null}

    <section
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby="tutorial-title"
      aria-describedby="tutorial-description"
      tabIndex={-1}
      className="pointer-events-auto fixed z-[130] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-2xl border border-blue-100 bg-white p-5 shadow-2xl shadow-slate-950/25 transition-[top,left] duration-200 motion-reduce:transition-none"
      style={panelPosition}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-[1.45] text-blue-600">{definition.eyebrow}</p>
          <div aria-live="polite" aria-atomic="true">
            <h2 id="tutorial-title" className="mt-1 text-xl font-extrabold leading-[1.45] text-slate-950">
              {phase === "invite" ? definition.introTitle : step?.title}
            </h2>
            <p id="tutorial-description" className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">
              {phase === "invite" ? definition.introDescription : step?.description}
            </p>
            {phase === "steps" && step?.tip ? (
              <p className="mt-2 text-xs font-semibold leading-relaxed text-blue-700">{step.tip}</p>
            ) : null}
          </div>
        </div>
      </div>

      {phase === "steps" ? (
        <>
          <p className="mt-4 text-xs font-bold text-slate-500">
            ขั้น {stepIndex + 1} จาก {definition.steps.length}
          </p>
          <div className="mt-2 flex items-center gap-1" aria-hidden="true">
            {definition.steps.map((item, index) => (
              <span
                key={item.id}
                className={`h-1.5 flex-1 rounded-full ${index <= stepIndex ? "bg-blue-600" : "bg-slate-200"}`}
              />
            ))}
          </div>

          {targetMissing ? (
            <div role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-relaxed text-amber-900">
              ยังหาจุดนี้ไม่พบ อาจกำลังโหลดหรือถูกซ่อนตามขนาดหน้าจอ
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setRetryToken((value) => value + 1)} className="min-h-11 rounded-xl border border-amber-300 bg-white px-3 font-bold">
                  ลองใหม่
                </button>
                <button type="button" onClick={goNext} className="min-h-11 rounded-xl px-3 font-bold text-amber-950">
                  ข้ามขั้นนี้
                </button>
              </div>
            </div>
          ) : step?.kind === "action" ? (
            <p className={`mt-4 rounded-xl px-3 py-2 text-sm font-bold ${actionSatisfied ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`} role="status">
              {actionSatisfied ? "ทำสำเร็จแล้ว กดถัดไปได้เลย" : "ลองทำที่จุดที่ไฮไลต์"}
            </p>
          ) : null}
        </>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => void closeTutorial("skipped")}
          className="min-h-11 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100"
        >
          {phase === "invite" ? "ข้ามก่อน" : "ข้ามคู่มือ"}
        </button>

        <div className="flex items-center gap-2">
          {phase === "steps" && stepIndex > 0 ? (
            <button type="button" onClick={goBack} className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-100">
              <ChevronLeft className="size-4" aria-hidden="true" />
              ย้อนกลับ
            </button>
          ) : null}

          {phase === "invite" ? (
            <button type="button" onClick={startSteps} className="min-h-11 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200">
              เริ่มคู่มือ
            </button>
          ) : step && !targetMissing && (step.kind === "info" || actionSatisfied) ? (
            <button type="button" onClick={goNext} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-200">
              {stepIndex === definition.steps.length - 1 ? "เสร็จสิ้น" : "ถัดไป"}
              {stepIndex === definition.steps.length - 1 ? <Check className="size-4" aria-hidden="true" /> : null}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  </div>,
  portalTarget,
);
```

Keep the existing `useLayoutEffect` that calls `getTourPanelPosition()`. For invite and missing-target states, pass `targetRect = null` so the panel remains inside the viewport.

- [ ] **Step 10: Run the coordinator tests**

Run:

```powershell
rtk node --test tests/first-login-tour.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: PASS. Confirm the old migration test in `first-login-tour.test.mjs` remains unchanged and passing.

- [ ] **Step 11: Run lint before wiring the lab**

Run:

```powershell
rtk npm run lint -- src/components/FirstLoginTour.tsx src/lib/tutorials src/lib/onboarding-tour.ts src/lib/supabase/tutorial-progress.ts
```

Expected: PASS with no hook dependency, accessibility, or TypeScript lint errors.

- [ ] **Step 12: Review only the Task 3 diff**

Run:

```powershell
rtk git diff -- src/components/FirstLoginTour.tsx tests/first-login-tour.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: the existing geometry is preserved, Radix modal usage is removed only from this tour, and action steps cannot advance before a matching event. Do not stage or commit.

---

### Task 4: Wire Real Newton Controls, Run/Pause, Results, and Optional Save

**Files:**

- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx`
- Modify: `src/components/labs/simulation/NewtonsCoolingSimulation.tsx`
- Modify: `tests/newtons-cooling-controls.test.mjs`
- Modify: `tests/interactive-tutorial.test.mjs`

**Interfaces:**

- Consumes: `TUTORIAL_IDS.newtonsCooling`, `reportTutorialAction()`
- Adds to shared shell: optional `tutorialId?: TutorialId`
- Emits: initial temperature changed, ambient temperature changed, simulation started, simulation paused, and results opened
- Produces visible targets: scene, initial temperature, ambient temperature, run/pause, results, and results-save

- [ ] **Step 1: Add failing Newton instrumentation tests**

Append to `tests/newtons-cooling-controls.test.mjs`:

```js
test("Newton tutorial reports real controls and simulation state", () => {
  const newton = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );
  const shell = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(newton, /TUTORIAL_IDS\.newtonsCooling/);
  assert.match(newton, /newton\.initial-temperature\.changed/);
  assert.match(newton, /newton\.ambient-temperature\.changed/);
  assert.match(newton, /simulation\.started/);
  assert.match(newton, /simulation\.paused/);
  assert.match(newton, /newtons-cooling-initial-temperature/);
  assert.match(newton, /newtons-cooling-ambient-temperature/);
  assert.match(newton, /tutorialId=\{TUTORIAL_IDS\.newtonsCooling\}/);

  assert.match(shell, /tutorialId\?: TutorialId/);
  assert.match(shell, /simulation\.results-opened/);
  assert.match(shell, /data-tutorial-lab=\{labId\}/);
  assert.match(shell, /`\$\{labId\}-run`/);
  assert.match(shell, /`\$\{labId\}-results`/);
  assert.match(shell, /`\$\{labId\}-results-save`/);
});
```

Append to `tests/interactive-tutorial.test.mjs`:

```js
test("the final Newton step points to an optional save action inside results", () => {
  const catalog = read("src/lib/tutorials/catalog.ts");
  const shell = read("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(catalog, /newtons-cooling-results-save/);
  assert.match(catalog, /คู่มือนี้จบได้โดยไม่ต้องกดบันทึก/);
  assert.match(shell, /data-tutorial=\{tutorialId \? `\$\{labId\}-results-save` : undefined\}/);
});
```

- [ ] **Step 2: Run the tests and verify the missing targets fail**

Run:

```powershell
rtk node --test tests/newtons-cooling-controls.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: FAIL because neither simulation component emits Tutorial actions yet.

- [ ] **Step 3: Add reusable Tutorial targets and the results-open event to the shared shell**

In `SharedSimulationShell.tsx`, import:

```ts
import type { TutorialId } from "@/lib/tutorials/catalog";
import { reportTutorialAction } from "@/lib/tutorials/events";
```

Add to `SharedSimulationShellProps` and destructuring:

```ts
tutorialId?: TutorialId;
```

Add `data-tutorial-lab={labId}` to the outer `simulationStage` section.

Add these exact target attributes:

```tsx
data-tutorial={tutorialId ? `${labId}-results` : undefined}
```

on `resultsTrigger`, and:

```tsx
data-tutorial={tutorialId ? `${labId}-run` : undefined}
```

on the primary run button.

After `setResultsOpen(true)` inside the results trigger handler, report the semantic event:

```ts
if (tutorialId) {
  reportTutorialAction({
    tutorialId,
    actionId: "simulation.results-opened",
    labId,
  });
}
```

- [ ] **Step 4: Put an optional save action inside the open results drawer**

Inside the sticky results header, before the close button, render:

```tsx
<div className="ml-auto flex shrink-0 items-center gap-2">
  {showSaveButton && onSave ? (
    <button
      type="button"
      data-tutorial={tutorialId ? `${labId}-results-save` : undefined}
      onClick={onSave}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-xs font-black text-blue-700 transition hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <Save className="h-4 w-4" aria-hidden="true" />
      บันทึกผล
    </button>
  ) : null}
  <button
    ref={resultsCloseRef}
    type="button"
    onClick={closeResults}
    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    aria-label="ปิดผลการทดลอง"
  >
    <X className="h-5 w-5" aria-hidden="true" />
  </button>
</div>
```

Remove the old standalone results-close button so there remains exactly one close control. This save button calls the existing `onSave`; the Tutorial only highlights it and never invokes it.

- [ ] **Step 5: Report actual temperature changes and run state from Newton**

In `NewtonsCoolingSimulation.tsx`, import:

```ts
import { TUTORIAL_IDS } from "@/lib/tutorials/catalog";
import { reportTutorialAction } from "@/lib/tutorials/events";
```

Add these handlers after the state/ref synchronization effects:

```ts
const updateInitialTemperature = (value: number) => {
  if (value === initialTemp) return;
  setInitialTemp(value);
  initialTempRef.current = value;
  reportTutorialAction({
    tutorialId: TUTORIAL_IDS.newtonsCooling,
    actionId: "newton.initial-temperature.changed",
    labId,
  });
};

const updateAmbientTemperature = (value: number) => {
  if (value === ambientTemp) return;
  setAmbientTemp(value);
  ambientTempRef.current = value;
  reportTutorialAction({
    tutorialId: TUTORIAL_IDS.newtonsCooling,
    actionId: "newton.ambient-temperature.changed",
    labId,
  });
};
```

Inside `handleStartStop`, after assigning `nextIsRunning`, report:

```ts
reportTutorialAction({
  tutorialId: TUTORIAL_IDS.newtonsCooling,
  actionId: nextIsRunning ? "simulation.started" : "simulation.paused",
  labId,
});
```

Replace user-facing calls to `setInitialTemp` and `setAmbientTemp` in compact controls, presets, and editable drawer fields with the two handlers. Keep internal reset/effect state assignments direct so automatic state synchronization cannot complete a Tutorial action.

- [ ] **Step 6: Add exact targets to the two visible temperature controls**

Extend each `coolingControls` item with `tutorialTarget`:

```ts
{
  label: "อุณหภูมิเริ่มต้น (T₀)",
  shortLabel: "T₀",
  value: initialTemp,
  set: updateInitialTemperature,
  min: MIN_TEMPERATURE_C,
  max: MAX_TEMPERATURE_C,
  step: 1,
  suffix: "°C",
  color: "accent-rose-500",
  icon: Thermometer,
  tutorialTarget: "newtons-cooling-initial-temperature",
},
{
  label: "อุณหภูมิสิ่งแวดล้อม (Tₛ)",
  shortLabel: "Tₛ",
  value: ambientTemp,
  set: updateAmbientTemperature,
  min: MIN_TEMPERATURE_C,
  max: 50,
  step: 1,
  suffix: "°C",
  color: "accent-blue-500",
  icon: Thermometer,
  tutorialTarget: "newtons-cooling-ambient-temperature",
},
```

Keep the `k` item and give it `tutorialTarget: undefined`. Add to the mapped `<label>`:

```tsx
data-tutorial={control.tutorialTarget}
```

Pass the Tutorial identity to the shell:

```tsx
tutorialId={TUTORIAL_IDS.newtonsCooling}
```

- [ ] **Step 7: Run Newton and shared-shell regression tests**

Run:

```powershell
rtk node --test tests/newtons-cooling-controls.test.mjs tests/interactive-tutorial.test.mjs tests/simulation-number-inputs.test.mjs tests/simulation-mobile-fullscreen.test.mjs
```

Expected: PASS. Existing start/pause, number-input, results-drawer, and fullscreen contracts remain green.

- [ ] **Step 8: Review only the Task 4 diff**

Run:

```powershell
rtk git diff -- src/components/labs/simulation/SharedSimulationShell.tsx src/components/labs/simulation/NewtonsCoolingSimulation.tsx tests/newtons-cooling-controls.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: Newton alone opts into the Tutorial, shared-shell behavior for other labs remains unchanged, and no save action is invoked by the Tutorial. Do not stage or commit.

---

### Task 5: Role-Aware and Newton Replay Choices in Settings

**Files:**

- Modify: `src/components/SettingsModal.tsx`
- Modify: `tests/first-login-tour.test.mjs`
- Modify: `tests/interactive-tutorial.test.mjs`

**Interfaces:**

- Consumes: `getGeneralTutorialId(role)`, `TUTORIAL_IDS.newtonsCooling`, `getTutorialStartPath(tutorialId)`, `requestTutorialReplay(tutorialId)`
- Produces: two explicit replay buttons for student/teacher accounts; one contextual role guide and one Newton guide

- [ ] **Step 1: Add failing replay-choice tests**

Append to `tests/interactive-tutorial.test.mjs`:

```js
test("settings offers separate role and Newton tutorial replays", () => {
  const settings = read("src/components/SettingsModal.tsx");

  assert.match(settings, /getGeneralTutorialId\(role\)/);
  assert.match(settings, /TUTORIAL_IDS\.newtonsCooling/);
  assert.match(settings, /คู่มือเริ่มต้นสำหรับนักเรียน/);
  assert.match(settings, /คู่มือเริ่มต้นสำหรับคุณครู/);
  assert.match(settings, /คู่มือแล็บ Newton/);
  assert.match(settings, /handleReplayTutorial\(tutorialId: TutorialId\)/);
});
```

- [ ] **Step 2: Run the test and verify the old single replay button fails**

Run:

```powershell
rtk node --test tests/first-login-tour.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: FAIL because `SettingsModal` still calls replay without a Tutorial id.

- [ ] **Step 3: Replace the role-only replay handler with an exact Tutorial handler**

In `SettingsModal.tsx`, import:

```ts
import {
  getGeneralTutorialId,
  TUTORIAL_IDS,
  type TutorialId,
} from "@/lib/tutorials/catalog";
```

Inside the component, derive:

```ts
const generalTutorialId = getGeneralTutorialId(role);
```

Replace `handleReplayTutorial` with:

```ts
const handleReplayTutorial = (tutorialId: TutorialId) => {
  const startPath = getTutorialStartPath(tutorialId);
  requestTutorialReplay(tutorialId);
  onClose();

  if (pathname !== startPath) {
    router.push(startPath);
  }
};
```

- [ ] **Step 4: Render two concise replay choices without adding another nested card**

Replace the single blue Tutorial button group with:

```tsx
<div className="grid w-full gap-2 sm:w-auto">
  {generalTutorialId ? (
    <button
      type="button"
      onClick={() => handleReplayTutorial(generalTutorialId)}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
    >
      <MousePointerClick className="h-4 w-4" aria-hidden="true" />
      {role === "teacher"
        ? "คู่มือเริ่มต้นสำหรับคุณครู"
        : "คู่มือเริ่มต้นสำหรับนักเรียน"}
    </button>
  ) : null}
  <button
    type="button"
    onClick={() => handleReplayTutorial(TUTORIAL_IDS.newtonsCooling)}
    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 text-sm font-extrabold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:w-auto"
  >
    <MousePointerClick className="h-4 w-4" aria-hidden="true" />
    คู่มือแล็บ Newton
  </button>
</div>
```

Keep the existing `/guide` link and section hierarchy unchanged.

- [ ] **Step 5: Run replay and settings tests**

Run:

```powershell
rtk node --test tests/first-login-tour.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: PASS for role-specific labels, Newton choice, exact replay id, and route handoff.

- [ ] **Step 6: Review only the Task 5 diff**

Run:

```powershell
rtk git diff -- src/components/SettingsModal.tsx tests/first-login-tour.test.mjs tests/interactive-tutorial.test.mjs
```

Expected: the settings section gains two focused actions and no unrelated settings change. Do not stage or commit.

---

### Task 6: Full Verification, Responsive QA, Accessibility, and Quality Gates

**Files:**

- Verify all files listed in Tasks 1 through 5
- Update only defects found inside the approved Tutorial scope
- Update: `graphify-out/*` through the repository graph command

**Interfaces:**

- Verifies: catalog count, role isolation, persistence, action gate, replay, missing-target recovery, mobile layout, keyboard, reduced motion, and cleanup
- Does not deploy schema, commit, or push

- [ ] **Step 1: Run the full regression suite**

Run:

```powershell
rtk npm test
```

Expected: all Node regression tests PASS, including migration history and the existing 103-lab guards.

- [ ] **Step 2: Run lint**

Run:

```powershell
rtk npm run lint
```

Expected: PASS with no new warnings.

- [ ] **Step 3: Run the production build**

Run:

```powershell
rtk npm run build
```

Expected: PASS with `/labs/newtons-cooling/simulation`, `/labs`, and `/dashboard` compiled successfully.

- [ ] **Step 4: Start one bounded browser QA session**

Run the existing app locally with:

```powershell
rtk npm run dev
```

Verify these flows with authenticated student and teacher test accounts:

1. New student at `/labs`: invite, six steps, skip, complete, and profile/settings target.
2. New teacher at `/dashboard`: invite, six teacher-only steps, and no student copy.
3. Newton at `/labs/newtons-cooling/simulation`: change both temperatures, start, verify label becomes `หยุดชั่วคราว`, pause, open results, and finish beside the optional save button.
4. Settings replay: role guide routes to its start page and Newton routes to its simulation without resetting terminal progress.
5. Missing target: temporarily hide one target in browser tools, then verify `ลองใหม่`, `ข้ามขั้นนี้`, Escape, and page recovery.

- [ ] **Step 5: Check responsive and accessibility states in the same browser session**

Check widths 320, 375, 390, 414, 768, and 1440 pixels. At each relevant width verify:

- panel stays inside the viewport and never covers the highlighted action
- the spotlight hole accepts pointer and touch while the surrounding scrim blocks unrelated controls
- Tab reaches the highlighted control and instruction buttons; Enter/Space perform the real action
- Escape exits cleanly and focus remains visible
- reduced-motion mode removes bounce/smooth movement
- mobile navigation and AI button do not cover Tutorial actions
- no console errors, hydration warnings, horizontal overflow, or orphaned overlay after navigation/logout

- [ ] **Step 6: Run the Impeccable detector exactly once after UI edits**

Run:

```powershell
rtk node C:\Users\HP\.agents\skills\impeccable\scripts\detect.mjs src/components/FirstLoginTour.tsx src/components/SettingsModal.tsx src/components/labs/simulation/SharedSimulationShell.tsx src/components/labs/simulation/NewtonsCoolingSimulation.tsx
```

Expected: zero blocking findings. Fix only findings caused by this feature, then verify those fixes manually without rerunning the detector.

- [ ] **Step 7: Apply the Hallmark final review**

Read:

```powershell
rtk cmd /c type D:\Scisiam_app\.agents\skills\hallmark\references\slop-test.md
```

Check the finished UI once against the file. Preserve SciSiam's current spacing, blue accent, Thai typography, and component hierarchy; remove any new decorative UI that has no instructional purpose.

- [ ] **Step 8: Keep the code graph current**

Run:

```powershell
rtk graphify update .
```

Expected: the graph records the new tutorial modules and their links to `FirstLoginTour`, Settings, Supabase, the shared shell, and Newton.

- [ ] **Step 9: Run the final safety and diff checks**

Run:

```powershell
rtk git diff --check
```

Run:

```powershell
rtk git status --short
```

Run the repository secret scan:

```powershell
rtk rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: no whitespace errors, no secrets, no build output, and no unrelated user files modified by this feature.

- [ ] **Step 10: Read the Hallmark handoff contract and report accurately**

Read:

```powershell
rtk cmd /c type D:\Scisiam_app\.agents\skills\hallmark\references\contract.md
```

Report changed files, test/lint/build results, browser sizes and roles checked, whether local Supabase verification was available, and that the migration has not been deployed. Do not stage, commit, or push unless the user separately requests it.

---

## Plan Self-Review Checklist

- Spec coverage: Tasks 1, 3, 4, and 5 cover both roles, Newton's seven steps, real actions, replay, skip, retry, accessibility, and responsive behavior.
- Persistence coverage: Task 2 backfills existing users by their current role, preserves legacy onboarding writes, and covers versioned cross-device state, per-user RLS, explicit Data API grants, and offline retry. A student later approved as a teacher has no teacher Tutorial row yet, so the teacher guide can appear once.
- Side-effect coverage: Newton emits only semantic events; Tutorial never writes experiment data, saves results, creates rooms, submits work, or synthesizes clicks.
- Type consistency: `TutorialId`, `TutorialActionId`, `TutorialDefinition`, and `TutorialProgressStatus` are defined once and consumed with the same names in every later task.
- Dirty-worktree safety: all additive edits to `database.types.ts` and migration history preserve the existing avatar and institution changes.
- Dependency coverage: no package or lockfile changes are planned.
- Git policy: checkpoints use read-only diffs; commits and pushes are intentionally omitted until explicitly requested.
