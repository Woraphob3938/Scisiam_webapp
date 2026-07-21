# SciSiam NSC 2026 Software Disclaimer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เพิ่มข้อตกลงการใช้ซอฟต์แวร์ NSC 2026 ที่เปิดอัตโนมัติครั้งแรกบนหน้า Login/Register และเปิดอ่านซ้ำได้จาก Auth กับ Settings โดยไม่กระทบการยืนยันตัวตนเดิม

**Architecture:** เก็บข้อมูลทางการและข้อความประกาศไว้ในโมดูลข้อมูลเดียว สร้าง controlled dialog บน Radix/shadcn primitive ที่มีอยู่ แล้วเชื่อมสถานะเปิดอัตโนมัติเข้ากับ `AuthForm` และสถานะเปิดจาก Settings เข้ากับ `Navbar` การจดจำว่าเคยเห็นใช้ `localStorage` แบบ fail-safe เท่านั้น ไม่มี backend write

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Radix/shadcn Dialog, lucide-react, Node test runner

## Global Constraints

- ข้อความและชื่อทั้งหมดต้องตรงกับ `docs/superpowers/specs/2026-07-17-nsc-software-disclaimer-design.md`
- ใช้ชื่อผลงาน “ไซสยาม: ห้องทดลองวิทยาศาสตร์ออนไลน์ เพื่อการศึกษาไทยที่ยั่งยืนทั่วทุกพื้นที่” และชื่อผลิตภัณฑ์ “SciSiam Simulation Lab” แยกจากชื่อโครงการสนับสนุน
- ชื่อโครงการสนับสนุนคือ “โครงการการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย ครั้งที่ 28”
- ใช้คีย์ `scisiam_nsc_disclaimer_seen_v1`
- ไม่มี dependency ใหม่ ไม่มี Supabase write ไม่มี API request และไม่แก้ความหมาย checkbox สมัครสมาชิกเดิม
- ใช้ shared Dialog primitive ที่ `src/components/ui/dialog.tsx`; ห้ามสร้าง focus trap หรือ portal ชุดใหม่
- เนื้อหาไทยเป็น HTML text ไม่ใช่รูปภาพ ตัวอักษรอย่างน้อย 16px และ line-height อย่างน้อย 1.6
- ต้องทำงานที่ 320px และ 390px โดยไม่มี horizontal overflow
- ห้าม commit หรือ push จนกว่าผู้ใช้จะสั่งโดยชัดแจ้ง แต่ให้หยุดตรวจงานหลังแต่ละ task
- ทุกคำสั่ง shell ในสภาพแวดล้อมนี้ต้องขึ้นต้นด้วย `rtk`

## File Map

- Create `src/data/softwareDisclaimer.ts`: ข้อมูลทางการ ข้อความประกาศ และคีย์ localStorage
- Create `src/components/SoftwareDisclaimerDialog.tsx`: controlled dialog สำหรับแสดงข้อมูลและจัดการ focus
- Modify `src/components/ui/dialog.tsx`: ซ่อนไอคอนปุ่มปิดที่เป็นของตกแต่งจากโปรแกรมอ่านหน้าจอ
- Modify `src/components/auth/AuthForm.tsx`: เปิดครั้งแรก บันทึกสถานะ และเพิ่มปุ่มเปิดอ่านซ้ำ
- Modify `src/components/SettingsModal.tsx`: เพิ่มรายการเปิดข้อตกลงผ่าน callback
- Modify `src/components/Navbar.tsx`: ประสาน Settings กับ Disclaimer โดยไม่เปิด modal ซ้อนกัน
- Create `tests/software-disclaimer.test.mjs`: regression tests สำหรับข้อมูล dialog Auth Settings และ Navbar
- Update `graphify-out/*`: รัน incremental graph update หลังแก้ source code เสร็จ

---

### Task 1: Canonical disclaimer data

**Files:**
- Create: `tests/software-disclaimer.test.mjs`
- Create: `src/data/softwareDisclaimer.ts`

**Interfaces:**
- Produces: `SOFTWARE_DISCLAIMER_SEEN_KEY: "scisiam_nsc_disclaimer_seen_v1"`
- Produces: `SOFTWARE_DISCLAIMER` with `productName`, `workTitle`, `competitionProject`, `developers`, `advisor`, `institution`, and `body`

- [ ] **Step 1: Write the failing canonical-data test**

Create `tests/software-disclaimer.test.mjs` with:

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (relativePath) =>
  readFileSync(join(rootDir, relativePath), "utf8");

test("NSC software disclaimer keeps the approved canonical copy in one data module", () => {
  const dataPath = "src/data/softwareDisclaimer.ts";
  assert.equal(existsSync(join(rootDir, dataPath)), true, `${dataPath} should exist`);

  const source = readProjectFile(dataPath);
  assert.match(source, /scisiam_nsc_disclaimer_seen_v1/);
  assert.match(source, /ไซสยาม: ห้องทดลองวิทยาศาสตร์ออนไลน์ เพื่อการศึกษาไทยที่ยั่งยืนทั่วทุกพื้นที่/);
  assert.match(source, /SciSiam Simulation Lab/);
  assert.match(source, /นางสาวชัชนัน บุญเหลือง/);
  assert.match(source, /นายวรภพ ไชยวงศ์คต/);
  assert.match(source, /นายพิพัฒน์ โพธิ์ศรีสุข/);
  assert.match(source, /ผู้ช่วยศาสตราจารย์ ดร\.ทวี งามวิไลกร/);
  assert.match(source, /คณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร/);
  assert.match(source, /โครงการการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย ครั้งที่ 28/);
  assert.match(source, /เผยแพร่ซอฟต์แวร์นี้ตาม “ต้นฉบับ”/);
  assert.match(source, /ไม่มีวัตถุประสงค์ในเชิงพาณิชย์/);
  assert.match(source, /ไม่รับประกันความเสียหายต่าง ๆ/);
  assert.doesNotMatch(source, /\(ชื่อผู้พัฒนา\)|\(ชื่อสถาบัน\)|\(ชื่ออาจารย์ที่ปรึกษา\)|\(ชื่อโครงการ\)/);
});
```

- [ ] **Step 2: Run the test and verify the intended failure**

Run:

```powershell
rtk proxy node --test tests/software-disclaimer.test.mjs
```

Expected: FAIL because `src/data/softwareDisclaimer.ts` does not exist.

- [ ] **Step 3: Add the canonical data module**

Create `src/data/softwareDisclaimer.ts` with:

```ts
export const SOFTWARE_DISCLAIMER_SEEN_KEY =
  "scisiam_nsc_disclaimer_seen_v1" as const;

export const SOFTWARE_DISCLAIMER = {
  productName: "SciSiam Simulation Lab",
  workTitle:
    "ไซสยาม: ห้องทดลองวิทยาศาสตร์ออนไลน์ เพื่อการศึกษาไทยที่ยั่งยืนทั่วทุกพื้นที่",
  competitionProject:
    "โครงการการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย ครั้งที่ 28",
  developers: [
    "นางสาวชัชนัน บุญเหลือง",
    "นายวรภพ ไชยวงศ์คต",
    "นายพิพัฒน์ โพธิ์ศรีสุข",
  ],
  advisor: "ผู้ช่วยศาสตราจารย์ ดร.ทวี งามวิไลกร",
  institution:
    "คณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร",
  body:
    "ซอฟต์แวร์นี้เป็นผลงานที่พัฒนาขึ้นโดย นางสาวชัชนัน บุญเหลือง นายวรภพ ไชยวงศ์คต และนายพิพัฒน์ โพธิ์ศรีสุข จากคณะวิทยาศาสตร์และวิศวกรรมศาสตร์ มหาวิทยาลัยเกษตรศาสตร์ วิทยาเขตเฉลิมพระเกียรติ จังหวัดสกลนคร ภายใต้การดูแลของผู้ช่วยศาสตราจารย์ ดร.ทวี งามวิไลกร ภายใต้โครงการการแข่งขันพัฒนาโปรแกรมคอมพิวเตอร์แห่งประเทศไทย ครั้งที่ 28 ซึ่งสนับสนุนโดย สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ โดยมีวัตถุประสงค์เพื่อส่งเสริมให้นักเรียนและนักศึกษาได้เรียนรู้และฝึกทักษะในการพัฒนาซอฟต์แวร์ ลิขสิทธิ์ของซอฟต์แวร์นี้จึงเป็นของผู้พัฒนา ซึ่งผู้พัฒนาได้อนุญาตให้สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติเผยแพร่ซอฟต์แวร์นี้ตาม “ต้นฉบับ” โดยไม่มีการแก้ไขดัดแปลงใด ๆ ทั้งสิ้น ให้แก่บุคคลทั่วไปได้ใช้เพื่อประโยชน์ส่วนบุคคลหรือประโยชน์ทางการศึกษาที่ไม่มีวัตถุประสงค์ในเชิงพาณิชย์ โดยไม่คิดค่าตอบแทนการใช้ซอฟต์แวร์ ดังนั้น สำนักงานพัฒนาวิทยาศาสตร์และเทคโนโลยีแห่งชาติ จึงไม่มีหน้าที่ในการดูแล บำรุงรักษา จัดการอบรมการใช้งาน หรือพัฒนาประสิทธิภาพซอฟต์แวร์ รวมทั้งไม่รับรองความถูกต้องหรือประสิทธิภาพการทำงานของซอฟต์แวร์ ตลอดจนไม่รับประกันความเสียหายต่าง ๆ อันเกิดจากการใช้ซอฟต์แวร์นี้ทั้งสิ้น",
} as const;
```

- [ ] **Step 4: Run the focused test**

Run:

```powershell
rtk proxy node --test tests/software-disclaimer.test.mjs
```

Expected: PASS with 1 passing test.

- [ ] **Step 5: Review checkpoint**

Check `rtk proxy git diff -- src/data/softwareDisclaimer.ts tests/software-disclaimer.test.mjs`. Do not commit without user permission.

---

### Task 2: Accessible reusable disclaimer dialog

**Files:**
- Modify: `tests/software-disclaimer.test.mjs`
- Create: `src/components/SoftwareDisclaimerDialog.tsx`
- Modify: `src/components/ui/dialog.tsx`

**Interfaces:**
- Consumes: `SOFTWARE_DISCLAIMER`
- Produces: `SoftwareDisclaimerDialogProps`
- Produces: default export `SoftwareDisclaimerDialog`

```ts
export type SoftwareDisclaimerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};
```

- [ ] **Step 1: Add the failing dialog test**

Append to `tests/software-disclaimer.test.mjs`:

```js
test("software disclaimer dialog uses the shared accessible controlled dialog", () => {
  const componentPath = "src/components/SoftwareDisclaimerDialog.tsx";
  assert.equal(
    existsSync(join(rootDir, componentPath)),
    true,
    `${componentPath} should exist`,
  );

  const source = readProjectFile(componentPath);
  const sharedDialog = readProjectFile("src/components/ui/dialog.tsx");
  assert.match(source, /<Dialog open=\{open\} onOpenChange=\{handleOpenChange\}>/);
  assert.match(source, /<DialogTitle/);
  assert.match(source, /tabIndex=\{-1\}/);
  assert.match(source, /onOpenAutoFocus/);
  assert.match(source, /onCloseAutoFocus/);
  assert.match(source, /aria-describedby=\{undefined\}/);
  assert.match(source, /รับทราบและดำเนินการต่อ/);
  assert.match(source, /tabIndex=\{0\}/);
  assert.match(source, /text-base/);
  assert.match(source, /leading-\[1\.7\]/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(sharedDialog, /<XIcon\s+aria-hidden="true"/);
  assert.doesNotMatch(source, /createPortal|role="dialog"/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```powershell
rtk proxy node --test tests/software-disclaimer.test.mjs
```

Expected: FAIL because `SoftwareDisclaimerDialog.tsx` does not exist.

- [ ] **Step 3: Implement the controlled dialog**

Create `src/components/SoftwareDisclaimerDialog.tsx`. Use these exact behaviors:

```tsx
"use client";

import React, { useRef } from "react";
import { FileText, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SOFTWARE_DISCLAIMER } from "@/data/softwareDisclaimer";

export type SoftwareDisclaimerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDismiss?: () => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
};

export default function SoftwareDisclaimerDialog({
  open,
  onOpenChange,
  onDismiss,
  returnFocusRef,
}: SoftwareDisclaimerDialogProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onDismiss?.();
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-h-[min(820px,calc(100svh-3rem))]"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          titleRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (!returnFocusRef?.current) return;
          event.preventDefault();
          returnFocusRef.current.focus();
        }}
      >
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-5 pr-14 sm:px-7">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-800">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            NSC 2026
          </span>
          <DialogTitle
            ref={titleRef}
            tabIndex={-1}
            className="text-xl font-extrabold leading-[1.4] text-slate-950 outline-none sm:text-2xl"
          >
            ข้อตกลงในการใช้ซอฟต์แวร์
          </DialogTitle>
        </DialogHeader>

        <div
          tabIndex={0}
          className="grid min-h-0 gap-5 overflow-y-auto bg-slate-50/70 px-5 py-5 text-base leading-[1.7] text-slate-900 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-200 sm:px-7"
        >
          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-5 w-5 shrink-0 text-blue-700" aria-hidden="true" />
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-950">{SOFTWARE_DISCLAIMER.productName}</h3>
                <p className="mt-1 text-sm leading-[1.7] text-slate-700">{SOFTWARE_DISCLAIMER.workTitle}</p>
              </div>
            </div>
            <dl className="grid gap-3 text-sm leading-[1.7] sm:grid-cols-2">
              <div>
                <dt className="font-extrabold text-slate-950">คณะผู้พัฒนา</dt>
                <dd className="text-slate-700">{SOFTWARE_DISCLAIMER.developers.join(" • ")}</dd>
              </div>
              <div>
                <dt className="font-extrabold text-slate-950">อาจารย์ที่ปรึกษา</dt>
                <dd className="text-slate-700">{SOFTWARE_DISCLAIMER.advisor}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-extrabold text-slate-950">สถาบัน</dt>
                <dd className="text-slate-700">{SOFTWARE_DISCLAIMER.institution}</dd>
              </div>
            </dl>
          </section>

          <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="font-extrabold text-slate-950">ข้อความข้อตกลงฉบับเต็ม</h3>
            <p className="text-base leading-[1.7] text-slate-900">{SOFTWARE_DISCLAIMER.body}</p>
          </section>
        </div>

        <DialogFooter className="mx-0 mb-0 rounded-none border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <DialogClose asChild>
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 sm:w-auto"
            >
              รับทราบและดำเนินการต่อ
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Hide the shared close icon from assistive technology**

In `src/components/ui/dialog.tsx`, change the shared close icon to:

```tsx
<XIcon aria-hidden="true" />
```

Keep the existing `<span className="sr-only">ปิด</span>` as the accessible name.

- [ ] **Step 5: Run the focused test**

Run:

```powershell
rtk proxy node --test tests/software-disclaimer.test.mjs
```

Expected: PASS with 2 passing tests.

- [ ] **Step 6: Run lint for the affected files**

Run:

```powershell
rtk proxy npx eslint src/components/SoftwareDisclaimerDialog.tsx src/components/ui/dialog.tsx src/data/softwareDisclaimer.ts
```

Expected: exit code 0 with no warnings.

- [ ] **Step 7: Review checkpoint**

Inspect the rendered heading order, focus callbacks, scroll container, and button copy. Do not commit without user permission.

---

### Task 3: First-visit behavior and permanent Auth trigger

**Files:**
- Modify: `tests/software-disclaimer.test.mjs`
- Modify: `src/components/auth/AuthForm.tsx`

**Interfaces:**
- Consumes: `SOFTWARE_DISCLAIMER_SEEN_KEY`
- Consumes: `SoftwareDisclaimerDialog`
- Owns: `showSoftwareDisclaimer: boolean`
- Owns: `markSoftwareDisclaimerSeen(): void`

- [ ] **Step 1: Add the failing Auth integration test**

Append:

```js
test("login and register show the NSC disclaimer once and keep a permanent trigger", () => {
  const source = readProjectFile("src/components/auth/AuthForm.tsx");
  assert.match(source, /SoftwareDisclaimerDialog/);
  assert.match(source, /SOFTWARE_DISCLAIMER_SEEN_KEY/);
  assert.match(source, /localStorage\.getItem\(SOFTWARE_DISCLAIMER_SEEN_KEY\)/);
  assert.match(source, /localStorage\.setItem\(SOFTWARE_DISCLAIMER_SEEN_KEY, "true"\)/);
  assert.match(source, /try \{/);
  assert.match(source, /setShowSoftwareDisclaimer\(true\)/);
  assert.match(source, /ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026/);
  assert.match(source, /aria-haspopup="dialog"/);
  assert.match(source, /returnFocusRef=\{emailInputRef\}/);
  assert.match(source, /ref=\{emailInputRef\}/);
  assert.doesNotMatch(source, /supabase[\s\S]{0,80}SOFTWARE_DISCLAIMER_SEEN_KEY/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run `rtk proxy node --test tests/software-disclaimer.test.mjs`.

Expected: the new Auth integration test fails because the imports, state, storage calls, and trigger do not exist.

- [ ] **Step 3: Add imports, refs, and state**

Change the React import to include `useRef`, then add:

```tsx
import SoftwareDisclaimerDialog from "@/components/SoftwareDisclaimerDialog";
import { SOFTWARE_DISCLAIMER_SEEN_KEY } from "@/data/softwareDisclaimer";
```

Inside `AuthForm`, immediately after `const router = useRouter();`, add:

```tsx
const emailInputRef = useRef<HTMLInputElement>(null);
const [showSoftwareDisclaimer, setShowSoftwareDisclaimer] = useState(false);
```

- [ ] **Step 4: Add fail-safe first-visit storage behavior**

Add this effect with the other mount effects:

```tsx
useEffect(() => {
  const timer = window.setTimeout(() => {
    try {
      if (localStorage.getItem(SOFTWARE_DISCLAIMER_SEEN_KEY) !== "true") {
        setShowSoftwareDisclaimer(true);
      }
    } catch {
      setShowSoftwareDisclaimer(true);
    }
  }, 0);

  return () => window.clearTimeout(timer);
}, []);

const markSoftwareDisclaimerSeen = () => {
  try {
    localStorage.setItem(SOFTWARE_DISCLAIMER_SEEN_KEY, "true");
  } catch {
    // The disclaimer remains available through the permanent trigger.
  }
};
```

- [ ] **Step 5: Wire focus return and the permanent trigger**

Add `ref={emailInputRef}` to the existing `id="auth-email"` input.

Inside the form action area, after the login/register switch paragraph and before any demo-mode actions, add:

```tsx
<button
  type="button"
  aria-haspopup="dialog"
  onClick={() => setShowSoftwareDisclaimer(true)}
  className="mx-auto min-h-11 px-3 text-sm font-extrabold leading-[1.45] text-blue-700 underline underline-offset-4 hover:text-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
>
  ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026
</button>
```

Render the dialog as the final child of the outer section:

```tsx
<SoftwareDisclaimerDialog
  open={showSoftwareDisclaimer}
  onOpenChange={setShowSoftwareDisclaimer}
  onDismiss={markSoftwareDisclaimerSeen}
  returnFocusRef={emailInputRef}
/>
```

- [ ] **Step 6: Run focused and existing Auth tests**

Run:

```powershell
rtk proxy node --test tests/software-disclaimer.test.mjs tests/google-oauth.test.mjs tests/password-recovery.test.mjs tests/auth-entry-history.test.mjs
```

Expected: all tests pass.

- [ ] **Step 7: Review checkpoint**

Confirm the existing acceptance checkbox copy, submit flow, Google OAuth, password recovery, and role selection source are unchanged. Do not commit without user permission.

---

### Task 4: Settings and Navbar integration without nested modals

**Files:**
- Modify: `tests/software-disclaimer.test.mjs`
- Modify: `src/components/SettingsModal.tsx`
- Modify: `src/components/Navbar.tsx`

**Interfaces:**
- `SettingsModal` adds `onOpenSoftwareDisclaimer: () => void`
- `Navbar` owns `showSoftwareDisclaimer: boolean`
- `Navbar` owns `profileMenuTriggerRef: React.RefObject<HTMLButtonElement | null>`

- [ ] **Step 1: Add the failing Settings/Navbar test**

Append:

```js
test("settings opens the disclaimer through Navbar without nesting modals", () => {
  const settings = readProjectFile("src/components/SettingsModal.tsx");
  const navbar = readProjectFile("src/components/Navbar.tsx");

  assert.match(settings, /onOpenSoftwareDisclaimer: \(\) => void/);
  assert.match(settings, /ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026/);
  assert.match(settings, /onClick=\{onOpenSoftwareDisclaimer\}/);
  assert.doesNotMatch(settings, /<SoftwareDisclaimerDialog/);

  assert.match(navbar, /SoftwareDisclaimerDialog/);
  assert.match(navbar, /profileMenuTriggerRef/);
  assert.match(navbar, /setShowSettingsModal\(false\)/);
  assert.match(navbar, /setShowSoftwareDisclaimer\(true\)/);
  assert.match(navbar, /onOpenSoftwareDisclaimer=\{openSoftwareDisclaimerFromSettings\}/);
  assert.match(navbar, /returnFocusRef=\{profileMenuTriggerRef\}/);
});
```

- [ ] **Step 2: Run the focused test and verify failure**

Run `rtk proxy node --test tests/software-disclaimer.test.mjs`.

Expected: the Settings/Navbar integration test fails.

- [ ] **Step 3: Extend SettingsModal with a callback and visible action**

Add `FileText` to the existing lucide import. Change the props to:

```tsx
export default function SettingsModal({
  isOpen,
  onClose,
  onOpenSoftwareDisclaimer,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenSoftwareDisclaimer: () => void;
}) {
```

Insert this section after the account/password section and before the scrollable content closes:

```tsx
<section className="rounded-2xl border border-slate-200 bg-white p-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-base font-extrabold leading-[1.45] text-slate-950">
          ข้อตกลงการใช้ซอฟต์แวร์ NSC 2026
        </h3>
        <p className="text-sm font-semibold leading-relaxed text-slate-600">
          เปิดอ่านข้อความประกาศของโครงการและข้อมูลคณะผู้พัฒนา
        </p>
      </div>
    </div>
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={onOpenSoftwareDisclaimer}
      className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-extrabold text-blue-800 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
    >
      เปิดอ่าน
    </button>
  </div>
</section>
```

- [ ] **Step 4: Coordinate both dialogs in Navbar**

Add `useRef` to the React import, import `SoftwareDisclaimerDialog`, and add:

```tsx
const profileMenuTriggerRef = useRef<HTMLButtonElement>(null);
const [showSoftwareDisclaimer, setShowSoftwareDisclaimer] = useState(false);

const openSoftwareDisclaimerFromSettings = () => {
  setShowSettingsModal(false);
  window.setTimeout(() => setShowSoftwareDisclaimer(true), 0);
};
```

Add these attributes to the persistent profile-menu trigger button:

```tsx
ref={profileMenuTriggerRef}
type="button"
aria-haspopup="menu"
aria-expanded={showProfileMenu}
```

Change the Settings render and add the Disclaimer sibling:

```tsx
<SettingsModal
  isOpen={showSettingsModal}
  onClose={() => setShowSettingsModal(false)}
  onOpenSoftwareDisclaimer={openSoftwareDisclaimerFromSettings}
/>
<SoftwareDisclaimerDialog
  open={showSoftwareDisclaimer}
  onOpenChange={setShowSoftwareDisclaimer}
  returnFocusRef={profileMenuTriggerRef}
/>
```

- [ ] **Step 5: Run focused and affected regression tests**

Run:

```powershell
rtk proxy node --test tests/software-disclaimer.test.mjs tests/password-recovery.test.mjs tests/profile-presence.test.mjs tests/product-consolidation.test.mjs
```

Expected: all tests pass.

- [ ] **Step 6: Review checkpoint**

Verify the Settings callback closes Settings before opening Disclaimer and that `SettingsModal.tsx` does not render `SoftwareDisclaimerDialog`. Do not commit without user permission.

---

### Task 5: Full verification, accessibility QA, and graph refresh

**Files:**
- Verify: `src/data/softwareDisclaimer.ts`
- Verify: `src/components/SoftwareDisclaimerDialog.tsx`
- Verify: `src/components/auth/AuthForm.tsx`
- Verify: `src/components/SettingsModal.tsx`
- Verify: `src/components/Navbar.tsx`
- Verify: `tests/software-disclaimer.test.mjs`
- Update: `graphify-out/*`

**Interfaces:**
- Consumes the completed feature from Tasks 1–4
- Produces verification evidence only; no new product behavior

- [ ] **Step 1: Run the complete regression suite**

Run:

```powershell
rtk proxy npm test
```

Expected: exit code 0 and every test passes.

- [ ] **Step 2: Run lint**

Run:

```powershell
rtk proxy npm run lint
```

Expected: exit code 0 with no ESLint errors.

- [ ] **Step 3: Run the production build**

Run:

```powershell
rtk proxy npm run build
```

Expected: exit code 0 and Next.js reports a successful production build.

- [ ] **Step 4: Run browser QA on `/login` and `/register`**

Start the app with `rtk proxy npm run dev`. Verify all of these in a real browser:

1. Clear `scisiam_nsc_disclaimer_seen_v1`; loading `/login` opens the dialog once.
2. The dialog title receives initial focus and screen-reader structure starts at an H2.
3. Tab and Shift+Tab stay inside the dialog; Escape closes it.
4. Closing stores `"true"`; refreshing does not auto-open it again.
5. The permanent Auth trigger opens the dialog after the seen flag exists.
6. Closing after Auth manual open returns focus to the email input.
7. At widths 390px and 320px the content reflows without horizontal scrolling; header and footer remain reachable.
8. The scroll container accepts keyboard focus and scrolls with arrow/Page Down keys.
9. Logging in, switching to Register, password recovery, and Google OAuth buttons retain their existing behavior.
10. From an authenticated page, Settings closes before Disclaimer opens; closing Disclaimer returns focus to the profile-menu trigger.
11. Text contrast, button contrast, visible focus rings, forced-colors visibility, and reduced-motion behavior pass the accessibility checklist.
12. No console errors, hydration warnings, or duplicate-modal focus warnings appear.

- [ ] **Step 5: Refresh the code knowledge graph**

Run:

```powershell
rtk proxy graphify update .
```

Expected: the incremental graph update completes without shrinking or corruption errors.

- [ ] **Step 6: Run the secret scan required by AGENTS.md**

Run:

```powershell
rtk rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: no committed secret value is reported. Placeholder environment-variable names are acceptable only in approved documentation or examples.

- [ ] **Step 7: Final accessibility-lead review**

Record any finding with rule, severity, specialist, file/location, impact, and remediation. The feature is no-ship if focus trapping, Escape, focus return, text reflow, readable contrast, or accessible naming fails.

- [ ] **Step 8: Final review checkpoint**

Run `rtk proxy git status --short` and `rtk proxy git diff --check`. Report changed files, verification results, browser QA results, and any warning. Do not stage, commit, or push without explicit user permission.
