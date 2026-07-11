# Newton Cooling Hybrid Simulation SVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** เปลี่ยน viewport ของ Newton Cooling จากภาพประกอบนิ่งให้เป็นชุดทดลองที่แสดงทิศทางและความแรงของการถ่ายเทความร้อนจากค่าจริง

**Architecture:** คง state และแบบจำลองเดิมทั้งหมด แล้วคำนวณ presentation state ภายใน `CoolingViewport` จาก `currentTemp`, `ambientTemp`, `coolingConstant`, `isHeaterOn` และ `isRunning` เท่านั้น SVG ใช้ state นี้กำหนดลูกศร สี สถานะ และ animation class โดยไม่เพิ่ม animation loop ใน React

**Tech Stack:** React 19, TypeScript, inline responsive SVG, Tailwind CSS v4, Node test runner

## Global Constraints

- แก้เฉพาะ viewport และ regression test; ไม่เปลี่ยนสมการ กราฟ save flow หรือ shared shell
- ไม่เพิ่ม dependency
- ไม่จำลองการเดือด การแข็งตัว หรือ latent heat
- animation ต้องหยุดเมื่อ pause และรองรับ `prefers-reduced-motion`
- สีไม่เป็นช่องทางเดียวในการสื่อสถานะ
- ไม่ commit หรือ push จนกว่าผู้ใช้จะขอ

---

### Task 1: Lock the thermal-state SVG contract

**Files:**
- Modify: `tests/newtons-cooling-controls.test.mjs`
- Test: `tests/newtons-cooling-controls.test.mjs`

**Interfaces:**
- Consumes: source text from `NewtonsCoolingSimulation.tsx`
- Produces: regression contract for `temperatureDelta`, `thermalDirection`, SVG state attributes, reduced motion, and removal of misleading bubbles/steam

- [ ] **Step 1: Write the failing test**

```js
test("Newton cooling viewport visualizes model-driven thermal flow", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/NewtonsCoolingSimulation.tsx",
  );

  assert.match(source, /const temperatureDelta = currentTemp - ambientTemp/);
  assert.match(source, /const thermalDirection =/);
  assert.match(source, /data-thermal-direction=\{thermalDirection\}/);
  assert.match(source, /กำลังเย็นลง/);
  assert.match(source, /กำลังอุ่นขึ้น/);
  assert.match(source, /ใกล้สมดุล/);
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.doesNotMatch(source, /Convection Bubbles/);
  assert.doesNotMatch(source, /Animated steam columns/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/newtons-cooling-controls.test.mjs`

Expected: FAIL because the current viewport has no `thermalDirection` contract and still contains bubble/steam groups.

---

### Task 2: Rebuild the viewport as a hybrid simulation

**Files:**
- Modify: `src/components/labs/simulation/NewtonsCoolingSimulation.tsx:51-316`
- Test: `tests/newtons-cooling-controls.test.mjs`

**Interfaces:**
- Consumes: existing `ViewportProps`
- Produces: the same `CoolingViewport` React element API with a model-driven SVG

- [ ] **Step 1: Derive presentation state without new React state**

```tsx
const temperatureDelta = currentTemp - ambientTemp;
const equilibriumTolerance = 0.5;
const thermalDirection =
  Math.abs(temperatureDelta) <= equilibriumTolerance
    ? "equilibrium"
    : temperatureDelta > 0
      ? "outward"
      : "inward";
const flowMagnitude = Math.min(
  1,
  (Math.abs(temperatureDelta) / 60) * (0.5 + coolingConstant * 2),
);
const flowPace = flowMagnitude >= 0.65 ? "fast" : flowMagnitude >= 0.28 ? "medium" : "slow";
const thermalStatus =
  thermalDirection === "outward"
    ? "กำลังเย็นลง"
    : thermalDirection === "inward"
      ? "กำลังอุ่นขึ้น"
      : "ใกล้สมดุล";
```

- [ ] **Step 2: Replace decorative scene chrome with a chamber and larger apparatus**

Use one `viewBox="0 0 600 320"` containing:

- chamber frame and work surface
- left air inlet and fan
- central beaker, thermometer, retort stand, heater plate, and digital sensor
- compact ambient and experiment-state labels integrated into the SVG
- unique gradient/filter/marker IDs derived from `useId()`

- [ ] **Step 3: Render direction-correct heat-flow paths**

```tsx
<g
  data-thermal-direction={thermalDirection}
  data-flow-pace={flowPace}
  data-running={isRunning}
  className={`newton-thermal-flow newton-thermal-flow--${flowPace}`}
>
  {thermalDirection === "outward" && <>{/* paths point away from beaker */}</>}
  {thermalDirection === "inward" && <>{/* paths point toward beaker */}</>}
  {thermalDirection === "equilibrium" && <>{/* static balanced markers */}</>}
</g>
```

- [ ] **Step 4: Add lightweight state motion inside SVG styles**

```css
@keyframes newton-flow-dash { to { stroke-dashoffset: -28; } }
@keyframes newton-fan-spin { to { transform: rotate(360deg); } }
.newton-thermal-flow[data-running="true"] { animation-play-state: running; }
.newton-thermal-flow[data-running="false"] { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .newton-thermal-flow, .newton-chamber-fan, .newton-convection {
    animation: none !important;
  }
}
```

- [ ] **Step 5: Preserve accessible SVG semantics**

Update `<desc>` to include `thermalStatus`, current temperature, ambient temperature, and whether the heater is on. Keep decorative details inside the single informative SVG and expose status through text as well as color.

- [ ] **Step 6: Run focused tests**

Run: `node --test tests/newtons-cooling-controls.test.mjs`

Expected: all Newton cooling tests PASS.

---

### Task 3: Verify responsive behavior and project integrity

**Files:**
- Verify: `src/components/labs/simulation/NewtonsCoolingSimulation.tsx`
- Verify: `tests/newtons-cooling-controls.test.mjs`

**Interfaces:**
- Consumes: completed hybrid viewport
- Produces: verified desktop/mobile simulation with no regressions

- [ ] **Step 1: Run static verification**

Run: `npx tsc --noEmit`

Expected: exit code 0.

Run: `npm run lint`

Expected: exit code 0.

- [ ] **Step 2: Run full regression suite**

Run: `npm test`

Expected: all tests pass, including the thermal-flow viewport contract.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: Next.js production build exits with code 0.

- [ ] **Step 4: Browser QA**

Inspect `/labs/newtons-cooling/simulation` at desktop and 390px. Verify:

- apparatus remains the visual focus
- outward, inward, and equilibrium states use correct arrow directions and text
- pause stops motion while retaining state information
- negative values render without clipping
- reduced motion produces a static but understandable scene
- no horizontal overflow, hydration warning, console error, or control overlap

- [ ] **Step 5: Refresh the project graph**

Run: `graphify update .`

Expected: code graph updates without topology errors.

## Self-review

- Spec coverage: visual direction, scientific mapping, motion, responsive behavior, accessibility, and verification are each assigned to a task.
- Placeholder scan: no TBD, TODO, or unspecified implementation step remains.
- Type consistency: the existing `ViewportProps` API remains unchanged across all tasks.
- Git policy: commit steps are intentionally omitted because the user has not requested a commit or push.
