# Mobile Labs, Classroom, and Simulation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** แก้ประสบการณ์ใช้งาน SciSiam ทั้ง 8 จุดที่อนุมัติแล้ว ได้แก่หน้ารวมแล็บบนมือถือ, รูป AI ไออุ่น, การออกจากชั้นเรียน, เต็มจอบน iOS/iPad, ข้อความบันทึกผล, ช่องตัวเลข, Navbar ในห้องทดลอง และการซิงก์รูปโปรไฟล์

**Architecture:** แก้พฤติกรรมที่ใช้ร่วมกันใน shared components และ helper ก่อน แล้วให้หน้ารายแล็บ/รายฟีเจอร์ใช้พฤติกรรมเดียวกัน ฐานข้อมูลชั้นเรียนใช้ RPC ที่ตรวจผู้ใช้จาก `auth.uid()` และปฏิเสธเจ้าของห้องจากฝั่งเซิร์ฟเวอร์ ไม่ใช้สถานะ role จาก client เป็นสิทธิ์อนุญาต

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase Auth/Postgres RPC, Sonner, Node regression tests

## Global Constraints

- รักษาหน้าคอมพิวเตอร์เดิมในงานที่ระบุว่าแก้เฉพาะมือถือ
- ห้ามใช้ client role หรือการซ่อนปุ่มเป็นกลไก authorization
- ไม่แก้ migration เดิม ให้เพิ่ม forward migration ใหม่เท่านั้น
- ไม่ monkeypatch `window.alert`; เปลี่ยนเฉพาะข้อความสำเร็จจากการบันทึกผล
- ไม่เพิ่ม dependency ใหม่สำหรับงานนี้
- ห้าม commit หรือ push จนกว่าผู้ใช้จะสั่งในช่วงลงมือทำ
- หลังแก้โค้ดให้รัน `graphify update .`

---

## Task 1: Mobile lab discovery and AI ไออุ่น trigger

**Files:**
- Modify: `src/app/labs/page.tsx`
- Modify: `src/components/AIChatButton.tsx`
- Test: `tests/labs-navigation-ui.test.mjs`
- Test: `tests/mobile-labs-ui.test.mjs`

**Interfaces:**

```ts
function useMobileLabsView(): boolean;
```

หน้าจอที่กว้างไม่เกิน `639px` ต้อง:

- ไม่แสดงหมวดหมู่วิชา
- ไม่แสดงระดับชั้น
- ไม่เก็บตัวกรองที่ผู้ใช้มองไม่เห็นมาจำกัดผลลัพธ์
- ช่องค้นหายังค้นจากแล็บทั้งหมด 103 แล็บ

AI trigger ตอนปิดต้อง:

- ใช้ `/ai-oon-logo.png`
- แสดงรูปเต็มด้วย `object-contain`
- ไม่มีวงกลม พื้นหลัง หรือกรอบครอบรูป
- พื้นที่กดจริงไม่น้อยกว่า 44x44 px

- [ ] เพิ่ม regression test ที่ยืนยันว่า filter wrappers มี mobile-hidden behavior และผลค้นหาบน mobile ไม่ถูกจำกัดด้วย category/grade ที่ซ่อนอยู่
- [ ] เพิ่ม regression test ที่ยืนยันว่า AI trigger ไม่มี `rounded-full`, `overflow-hidden`, หรือ `object-cover` ในสถานะปิด
- [ ] รัน `rtk npm test -- tests/labs-navigation-ui.test.mjs tests/mobile-labs-ui.test.mjs` และยืนยันว่า test ใหม่ล้มก่อนแก้
- [ ] เพิ่ม media-query hook ที่ subscribe/unsubscribe อย่างถูกต้อง

```ts
function useMobileLabsView() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}
```

- [ ] เมื่อเป็น mobile ให้ effective category/grade เป็น `"all"` โดยไม่ทำลายค่าที่ผู้ใช้เลือกไว้สำหรับ desktop

```ts
const effectiveCategory = isMobileLabsView ? "all" : selectedCategory;
const effectiveGrade = isMobileLabsView ? "all" : selectedGrade;
```

- [ ] ห่อ `CategoryFilter` และ grade controls ด้วย `hidden sm:block`
- [ ] ปรับ AI trigger ให้เป็น transparent image button และเก็บ accessible label เดิม
- [ ] รัน test ชุดเดิมอีกครั้งและยืนยันว่าผ่าน
- [ ] ตรวจด้วย browser ที่ 390px และ desktop ว่ามือถือเหลือช่องค้นหา/รายการ ส่วน desktop ยังเห็น filter ครบ

**Commit boundary (only with explicit user authorization):**

```powershell
git add src/app/labs/page.tsx src/components/AIChatButton.tsx tests/labs-navigation-ui.test.mjs tests/mobile-labs-ui.test.mjs
git commit -m "fix: simplify mobile lab discovery"
```

---

## Task 2: Secure student leave-classroom flow

**Files:**
- Create: `supabase/migrations/20260729100000_add_leave_classroom_rpc.sql`
- Modify: `src/lib/supabase/database.types.ts`
- Modify: `src/lib/supabase/classrooms.ts`
- Modify: `src/app/classrooms/[id]/page.tsx`
- Modify: `tests/classrooms.test.mjs`
- Modify: `tests/classroom-workspace-ui.test.mjs`

**Database interface:**

```sql
public.leave_classroom(p_classroom_id uuid) returns boolean
```

**Client interface:**

```ts
export async function leaveClassroom(classroomId: string): Promise<void>;
```

- [ ] เพิ่ม test ว่า migration ใช้ `auth.uid()`, ลบเฉพาะ membership ของผู้ใช้ปัจจุบัน และปฏิเสธ `classrooms.creator_id = auth.uid()`
- [ ] เพิ่ม UI test ว่า non-owner เห็นปุ่ม `ออกจากชั้นเรียน` แต่ owner ไม่เห็น
- [ ] เพิ่ม UI test ว่าต้องยืนยันก่อนออกและสำเร็จแล้วกลับ `/classrooms`
- [ ] รัน `rtk npm test -- tests/classrooms.test.mjs tests/classroom-workspace-ui.test.mjs` และยืนยันว่า test ใหม่ล้มก่อนแก้
- [ ] เพิ่ม forward migration

```sql
create or replace function public.leave_classroom(p_classroom_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.classrooms
    where id = p_classroom_id
      and creator_id = current_user_id
  ) then
    raise exception 'classroom owner cannot leave' using errcode = '42501';
  end if;

  delete from public.classroom_members
  where classroom_id = p_classroom_id
    and user_id = current_user_id;

  return found;
end;
$$;

revoke all on function public.leave_classroom(uuid) from public, anon;
grant execute on function public.leave_classroom(uuid) to authenticated;
```

- [ ] เพิ่ม RPC type ใน `database.types.ts`

```ts
leave_classroom: {
  Args: { p_classroom_id: string };
  Returns: boolean;
};
```

- [ ] เพิ่ม wrapper ที่ใช้ `requireCurrentUserId`, `validateClassroomId`, และ error mapper เดิม
- [ ] เพิ่มปุ่ม non-owner, confirmation dialog, loading/disabled state และข้อความ error ภาษาไทย
- [ ] เมื่อสำเร็จใช้ `router.replace("/classrooms")` และ refresh รายการห้อง
- [ ] รัน test ชุด classroom และยืนยันว่าผ่าน
- [ ] ใช้ Supabase CLI ตรวจ migration syntax หาก local project เชื่อมอยู่

**Commit boundary (only with explicit user authorization):**

```powershell
git add supabase/migrations/20260729100000_add_leave_classroom_rpc.sql src/lib/supabase/database.types.ts src/lib/supabase/classrooms.ts src/app/classrooms/[id]/page.tsx tests/classrooms.test.mjs tests/classroom-workspace-ui.test.mjs
git commit -m "feat: let students leave classrooms safely"
```

---

## Task 3: Cross-platform numeric input behavior

**Files:**
- Modify: `src/components/labs/simulation/ManualNumberInput.tsx`
- Modify: `src/components/labs/simulation/UnifiedLegacySimulation.tsx`
- Modify: `src/components/labs/simulation/RatioProportionSimulation.tsx`
- Create: `tests/simulation-number-inputs.test.mjs`

**Interfaces:**

```ts
export function normalizeNumberDraft(raw: string): string;
export function isIntermediateNumberDraft(raw: string): boolean;
export function parseCommittedNumber(
  raw: string,
  options: { min: number; max: number; fallback: number; step?: number },
): number;
```

Valid temporary drafts:

```ts
""
"-"
"."
"-."
"12."
"-12.5"
```

- [ ] เพิ่ม tests สำหรับ empty draft, negative draft, decimal, comma decimal, clamp min/max และ fallback
- [ ] เพิ่ม source test ว่า shared numeric field ใช้ `type="text"` กับ `inputMode="decimal"` แทน `type="number"`
- [ ] รัน `rtk npm test -- tests/simulation-number-inputs.test.mjs` และยืนยันว่า test ล้มก่อนแก้
- [ ] เปลี่ยน `BoundedNumberInput` ให้เก็บ string draft แยกจาก committed numeric value
- [ ] ระหว่างพิมพ์ไม่บังคับค่า fallback และไม่เติมเลขกลับทันที
- [ ] commit ค่าเมื่อ blur หรือ Enter; clamp เฉพาะตอน commit
- [ ] รองรับ comma decimal โดย normalize เป็น dot
- [ ] เปลี่ยน numeric inputs ที่ยังเขียนเองใน `UnifiedLegacySimulation` และ `RatioProportionSimulation` ให้ใช้ shared behavior
- [ ] รัน test และทดลองบน iOS/Android viewport ว่าลบทั้งช่อง พิมพ์ `-25.5` และแก้เลขกลางข้อความได้

**Commit boundary (only with explicit user authorization):**

```powershell
git add src/components/labs/simulation/ManualNumberInput.tsx src/components/labs/simulation/UnifiedLegacySimulation.tsx src/components/labs/simulation/RatioProportionSimulation.tsx tests/simulation-number-inputs.test.mjs
git commit -m "fix: support editable numeric lab inputs"
```

---

## Task 4: Shared light-blue save toast

**Files:**
- Create: `src/components/labs/simulation/labSaveToast.ts`
- Modify: simulation components found by the scoped save-success alert search
- Create: `tests/simulation-save-toast.test.mjs`

**Interface:**

```ts
export const LAB_SAVE_SUCCESS_MESSAGE =
  "บันทึกสำเร็จ ให้ดูที่ผลการทดลอง";

export function showLabSaveSuccess(): void;
```

- [ ] ใช้ `rg` หาเฉพาะ `alert`/`window.alert` ที่เป็นผลสำเร็จจาก save และบันทึกรายชื่อไฟล์ก่อนแก้
- [ ] เพิ่ม test ว่าข้อความตรงตามที่อนุมัติ, duration เท่ากับ 2,000 ms และไม่มี native success alert เหลือ
- [ ] รัน `rtk npm test -- tests/simulation-save-toast.test.mjs` และยืนยันว่า test ล้มก่อนแก้
- [ ] สร้าง helper เดียวด้วย Sonner

```ts
import { toast } from "sonner";

export const LAB_SAVE_SUCCESS_MESSAGE =
  "บันทึกสำเร็จ ให้ดูที่ผลการทดลอง";

export function showLabSaveSuccess() {
  toast(LAB_SAVE_SUCCESS_MESSAGE, {
    duration: 2000,
    className: "!border-sky-200 !bg-sky-50 !text-sky-950",
  });
}
```

- [ ] เปลี่ยนเฉพาะ success alerts; คง error alerts หรือเปลี่ยนเป็น error toast แยกเมื่อจำเป็น
- [ ] ตรวจว่า toast อยู่ด้านบน ขนาดเล็ก ไม่บังปุ่มทดลอง และหายเองใน 2 วินาที
- [ ] รัน test และตรวจ save flow อย่างน้อย Newton cooling กับหนึ่ง shared chemistry simulation

**Commit boundary (only with explicit user authorization):**

```powershell
git add src/components/labs/simulation/labSaveToast.ts src/components/labs/simulation tests/simulation-save-toast.test.mjs
git commit -m "fix: standardize experiment save feedback"
```

---

## Task 5: iOS/iPad fullscreen and simulation-only chrome

**Files:**
- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx`
- Modify: legacy simulation roots returned by `rg -l "<Navbar" src/components/labs/simulation`
- Create: `src/components/labs/simulation/useSimulationFullscreen.ts`
- Create: `tests/simulation-fullscreen-ui.test.mjs`
- Modify: `tests/mobile-chrome-scroll.test.mjs`

**Interface:**

```ts
export interface SimulationFullscreenController {
  isFullscreen: boolean;
  toggleFullscreen(): Promise<void>;
}

export function useSimulationFullscreen(
  targetRef: RefObject<HTMLElement | null>,
): SimulationFullscreenController;
```

- [ ] เพิ่ม test ว่า simulation roots ไม่ render `<Navbar />`
- [ ] เพิ่ม test ว่า fullscreen helper รองรับ native, `webkitRequestFullscreen`, และ CSS fallback
- [ ] เพิ่ม test ว่า fallback ใช้ `100dvh`, `100dvw`, `fixed`, `inset-0` และล็อก body scroll
- [ ] รัน `rtk npm test -- tests/simulation-fullscreen-ui.test.mjs tests/mobile-chrome-scroll.test.mjs` และยืนยันว่า test ใหม่ล้ม
- [ ] สร้าง shared fullscreen hook

```ts
type WebkitFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type WebkitFullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
```

- [ ] ลอง native `requestFullscreen`, ต่อด้วย WebKit API, แล้วใช้ CSS fallback เมื่อ API ไม่มีหรือ reject
- [ ] fallback ต้องใส่ target เป็น `fixed inset-0 z-[9999] h-[100dvh] w-[100dvw]` และคืน body overflow เดิมตอนออก/cleanup
- [ ] subscribe ทั้ง `fullscreenchange` และ `webkitfullscreenchange`
- [ ] ย้าย logic จาก `SharedSimulationShell` มาใช้ hook เดียว
- [ ] เอา Navbar ออกจาก `SharedSimulationShell` และ legacy simulation roots เท่านั้น ไม่เปลี่ยน Navbar หน้าอื่น
- [ ] ตรวจ iPhone/iPad Safari viewport: เข้าเต็มจอ, ออกเต็มจอ, หมุนอุปกรณ์, และกลับหน้าปกติได้โดยไม่ค้าง scroll lock

**Commit boundary (only with explicit user authorization):**

```powershell
git add src/components/labs/simulation/SharedSimulationShell.tsx src/components/labs/simulation/useSimulationFullscreen.ts src/components/labs/simulation tests/simulation-fullscreen-ui.test.mjs tests/mobile-chrome-scroll.test.mjs
git commit -m "fix: improve simulation fullscreen on ios"
```

---

## Task 6: Immediate avatar synchronization

**Files:**
- Modify: `src/context/AuthContext.tsx`
- Modify: `src/app/profile/page.tsx`
- Modify: `src/lib/supabase/auth-cache.ts` only if its public helper cannot preserve unchanged fields
- Modify: `tests/profile-presence.test.mjs`

**Data flow:**

```text
Profile save
  -> Supabase profile row
  -> cacheScisiamAuth(...)
  -> SCISIAM_AUTH_EVENT
  -> AuthContext reads cache immediately
  -> Navbar rerenders
  -> AuthContext revalidates with Supabase
```

- [ ] เพิ่ม test ว่า `SCISIAM_AUTH_EVENT` โหลด cache ก่อนรอ network revalidation
- [ ] เพิ่ม test ว่า profile save ใช้ `cacheScisiamAuth` แทนการเขียน localStorage และ dispatch event เอง
- [ ] เพิ่ม test ว่าเปลี่ยนเฉพาะชื่อไม่ทำให้ avatar path หาย และเปลี่ยน avatar แล้ว Navbar/Profile ได้ path เดียวกัน
- [ ] รัน `rtk npm test -- tests/profile-presence.test.mjs` และยืนยันว่า test ใหม่ล้ม
- [ ] เปลี่ยน event handler ใน `AuthContext`

```ts
const handleAuthUpdated = () => {
  loadAuthStateFromCache(false);
  void loadAuthState();
};
```

- [ ] หลัง profile update สำเร็จเรียก `cacheScisiamAuth` ด้วย role/name/avatar ล่าสุด
- [ ] ลบ localStorage write และ manual `window.dispatchEvent` ที่ซ้ำจาก profile page
- [ ] ตรวจ avatar cache-busting/version behavior เพื่อให้รูปใหม่ไม่ติด browser cache
- [ ] รัน test และทดลองเปลี่ยนรูปจาก profile โดยดู Navbar พร้อมกัน

**Commit boundary (only with explicit user authorization):**

```powershell
git add src/context/AuthContext.tsx src/app/profile/page.tsx src/lib/supabase/auth-cache.ts tests/profile-presence.test.mjs
git commit -m "fix: sync profile avatars immediately"
```

---

## Task 7: Integrated regression and responsive QA

**Files:**
- Modify: tests only if integration coverage reveals an uncovered regression
- Update: `graphify-out/*` through the project graph command

- [ ] รัน focused tests:

```powershell
rtk npm test -- tests/labs-navigation-ui.test.mjs tests/mobile-labs-ui.test.mjs tests/classrooms.test.mjs tests/classroom-workspace-ui.test.mjs tests/simulation-number-inputs.test.mjs tests/simulation-save-toast.test.mjs tests/simulation-fullscreen-ui.test.mjs tests/profile-presence.test.mjs
```

Expected: all focused tests pass with no unhandled promise rejection.

- [ ] รัน full regression:

```powershell
rtk npm test
```

Expected: all tests pass.

- [ ] รัน lint:

```powershell
rtk npm run lint
```

Expected: exit code 0, no new warnings in changed files.

- [ ] รัน production build:

```powershell
rtk npm run build
```

Expected: exit code 0 and no hydration/type errors.

- [ ] รัน secret scan:

```powershell
rtk rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\\s*="
```

Expected: no committed secret values.

- [ ] ตรวจ browser ที่ 390px, tablet และ desktop:
  - `/labs`
  - `/labs/newtons-cooling/simulation`
  - shared chemistry simulation หนึ่งรายการ
  - `/classrooms/[id]` ในมุมมอง owner และ member
  - `/profile`
- [ ] ตรวจ console ว่าไม่มี hydration warning, fullscreen error, `Failed to fetch` ที่เกิดจากโค้ดใหม่ หรือ state update หลัง unmount
- [ ] รัน `rtk graphify update .`
- [ ] ตรวจ `git diff --check` และ `git status --short`

**Final commit boundary (only with explicit user authorization):**

```powershell
git add <only files changed by this implementation>
git commit -m "fix: polish mobile classroom and simulation flows"
```

Do not push until the user explicitly asks.
