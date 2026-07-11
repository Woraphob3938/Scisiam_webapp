# Shared Simulation Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` (recommended) or `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize every ready SciSiam simulation on the Newton's Law of Cooling workspace language without changing scientific models or forcing complex controls into a small dock.

**Architecture:** `SharedSimulationShell` already wraps the direct, legacy chemistry, applied mathematics, and foundation simulation engines. It will infer the persistent lower dock from an existing `compactControls` node, while preserving the existing `persistentControls` prop for Newton's Cooling. Simulations without compact controls retain the internal panel, so complex workflows stay contained in fullscreen rather than overflowing the stage.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Node built-in test runner, Playwright browser QA.

## Global Constraints

- Preserve every lab's apparatus, model, variables, save behavior, and readiness route.
- Reuse `SharedSimulationShell`; do not copy workspace chrome into individual simulations.
- Foundation exploration labs remain free of fake real-time metrics, graphs, save actions, missions, timers, and start controls.
- Keep one visual boundary around the experiment; do not add nested decorative frames.
- Preserve native keyboard-operable controls, visible focus rings, and icon-button labels.
- Verify desktop, 390px, fullscreen, no horizontal overflow, and the advanced-panel close action.
- Do not commit or push unless the user requests it.

---

### Task 1: Lock the shared workspace behavior with regression tests

**Files:**
- Modify: `tests/newtons-cooling-controls.test.mjs:55-135`
- Modify: `tests/scisiam-regressions.test.mjs:977-990`

**Interfaces:**
- Consumes: `SharedSimulationShell` props `compactControls?: React.ReactNode` and `persistentControls?: boolean`.
- Produces: source-level regression coverage for automatic dock selection and preserved foundation exclusions.

- [ ] **Step 1: Write the failing shared-shell contract test**

```js
test("shared shell promotes compact controls to the persistent dock", () => {
  const source = readProjectFile(
    "src/components/labs/simulation/SharedSimulationShell.tsx",
  );

  assert.match(source, /const hasCompactControls =/);
  assert.match(
    source,
    /const usesPersistentControlDock = persistentControls \|\| hasCompactControls/,
  );
  assert.match(source, /usesPersistentControlDock \? persistentControlDock : controlsDrawer/);
});
```

- [ ] **Step 2: Extend the foundation guard before changing the shell**

```js
const compactFoundationSources = [
  "src/components/labs/simulation/FoundationExplorerSimulation.tsx",
  "src/components/labs/simulation/AtmosphereLayersSimulation.tsx",
];

for (const file of compactFoundationSources) {
  const source = readProjectFile(file);
  assert.match(
    source,
    /compactControls=\{controls\}/,
    `${file} should keep its exploration controls compact`,
  );
}
```

Keep the existing `showLiveMetrics={false}`, `showInfoTabs={false}`, and `showSaveButton={false}` assertions for all three foundation sources.

- [ ] **Step 3: Run the focused suite and verify it fails for the missing dock inference**

Run: `node --test tests/newtons-cooling-controls.test.mjs`

Expected: the new shared-shell test fails because `usesPersistentControlDock` does not exist yet.

- [ ] **Step 4: Do not change production code until the failure names the missing inference**

Expected: all prior Newton cooling tests remain green; only the new contract is red.

### Task 2: Make the lower dock automatic for safe compact-control simulations

**Files:**
- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx:151-417`
- Test: `tests/newtons-cooling-controls.test.mjs:55-135`

**Interfaces:**
- Consumes: `persistentControls`, `compactControls`, `controls`, `controlsOpen`, and existing stage-position class names.
- Produces: `hasCompactControls` and `usesPersistentControlDock` local booleans used consistently by the stage, fullscreen button, advanced panel, and dock selection.

- [ ] **Step 1: Add minimal dock inference immediately after `collapsedControls`**

```tsx
const hasCompactControls =
  compactControls !== null && compactControls !== undefined && compactControls !== false;
const collapsedControls = compactControls ?? controls;
const hasCollapsedControls =
  collapsedControls !== null && collapsedControls !== undefined && collapsedControls !== false;
const usesPersistentControlDock = persistentControls || hasCompactControls;
```

- [ ] **Step 2: Route every shell layout decision through the inferred dock boolean**

Replace only these five references:

```tsx
const stageBottomClass = usesPersistentControlDock
  ? "bottom-[228px] sm:bottom-[220px]"
  : controlsOpen
    ? "bottom-[calc(32vh+48px)]"
    : hasCollapsedControls
      ? "bottom-[210px] sm:bottom-[220px]"
      : "bottom-[96px] sm:bottom-[104px]";

const fullscreenButtonBottomClass = usesPersistentControlDock
  ? "bottom-[188px] sm:bottom-[180px]"
  : stageBottomClass;

const persistentAdvancedPanel = usesPersistentControlDock && controlsOpen && (
  <section
    id="simulation-advanced-controls"
    data-testid="simulation-advanced-controls"
    className={`absolute inset-x-4 bottom-[210px] top-[122px] z-40 overflow-y-auto rounded-2xl border bg-white p-4 shadow-xl shadow-slate-900/15 sm:inset-x-5 md:left-auto md:w-[min(720px,calc(100%-2.5rem))] ${tone.border}`}
  >
    <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
      <h2 className="text-sm font-black text-slate-900">การตั้งค่าขั้นสูง</h2>
      <button
        type="button"
        onClick={() => setControlsOpen(false)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="ปิดการตั้งค่าขั้นสูง"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    {controls}
    {showSaveButton && onSave && (
      <button onClick={onSave} className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black shadow-sm ${tone.button}`}>
        <Save className="h-4 w-4" />
        บันทึกผลการทดลอง
      </button>
    )}
  </section>
);

{usesPersistentControlDock ? persistentControlDock : controlsDrawer}
```

Keep `persistentControls` in the public prop interface so Newton's Cooling remains backward compatible.

- [ ] **Step 3: Run the focused tests and verify green**

Run: `node --test tests/newtons-cooling-controls.test.mjs`

Expected: all tests pass, including the automatic dock contract.

- [ ] **Step 4: Check the diff is limited to shared workspace behavior**

Run: `git diff --check -- src/components/labs/simulation/SharedSimulationShell.tsx tests/newtons-cooling-controls.test.mjs`

Expected: exit code `0` with no whitespace errors.

### Task 3: Verify shared engines and foundation exploration capability boundaries

**Files:**
- Verify: `src/components/labs/simulation/UnifiedLegacySimulation.tsx:445-465`
- Verify: `src/components/labs/simulation/AppliedMathSimulation.tsx:2059-2085`
- Verify: `src/components/labs/simulation/FoundationExplorerSimulation.tsx:889-923`
- Verify: `src/components/labs/simulation/AtmosphereLayersSimulation.tsx:294-330`
- Test: `tests/scisiam-regressions.test.mjs:977-990`

**Interfaces:**
- Consumes: the automatic dock behavior from Task 2.
- Produces: confirmation that physics/chemistry, mathematics, and foundation engines use the same workspace without enabling restricted foundation capabilities.

- [ ] **Step 1: Run the foundation regression test after the shared-shell change**

Run: `node --test tests/scisiam-regressions.test.mjs --test-name-pattern="foundation simulations keep exploration-only chrome"`

Expected: pass; `showLiveMetrics`, `showInfoTabs`, and `showSaveButton` stay `false` for the foundation sources.

- [ ] **Step 2: Inspect shared-engine callers rather than adding duplicate layout wrappers**

Run: `rg -n "compactControls=\{compactControls\}" src/components/labs/simulation/UnifiedLegacySimulation.tsx src/components/labs/simulation/AppliedMathSimulation.tsx`

Expected: both shared engines pass their existing compact controls to `SharedSimulationShell`. Do not add a `Navbar`, a second fullscreen button, or a second outer card to either engine.

- [ ] **Step 3: Inspect foundation props after automatic docking**

```tsx
<SharedSimulationShell
  controls={controls}
  compactControls={controls}
  showLiveMetrics={false}
  showInfoTabs={false}
  showSaveButton={false}
/>
```

Confirm this remains an exploration workspace: the compact lower controls may be visible, but no experiment-only features are added.

- [ ] **Step 4: Run the full regression suite**

Run: `npm test`

Expected: all tests pass with no failures.

### Task 4: Browser, keyboard, and build verification across representative families

**Files:**
- Verify only: `src/components/labs/simulation/SharedSimulationShell.tsx`
- Verify only: `src/app/labs/[id]/simulation/page.tsx`

**Interfaces:**
- Consumes: the shared shell from Task 2 and route selection from the ready-lab registry.
- Produces: evidence that the common workspace remains usable on desktop, mobile, and fullscreen.

- [ ] **Step 1: Verify a physics shared-engine lab**

Open: `/labs/boyles-law/simulation`

Check: compact title, metrics placement, lower dock, fullscreen button above the dock, and no duplicate workspace frame.

- [ ] **Step 2: Verify a mathematics shared-engine lab**

Open: `/labs/function-builder/simulation`

Check: lower dock contains only its compact mathematical controls; graph and scene remain visible; no horizontal overflow at 390px.

- [ ] **Step 3: Verify a foundation exploration lab**

Open: `/labs/atmosphere-layers/simulation`

Check: the exploration controls remain available, but no real-time card, timer, save control, mission, or graph chrome appears.

- [ ] **Step 4: Test keyboard behavior in each representative route**

Use `Tab` to reach the fullscreen button, activate it with `Enter`, open the advanced panel with `Enter`, and close it with its labelled close button. Verify focus indicators remain visible and no control is skipped.

- [ ] **Step 5: Run lint and production build**

Run: `npm run lint`

Expected: exit code `0`.

Run: `npm run build`

Expected: Next.js compilation, TypeScript validation, and route generation complete with exit code `0`.

- [ ] **Step 6: Update the code graph after production changes**

Run: `graphify update .`

Expected: code graph update completes successfully.

## Plan Self-Review

### Spec Coverage

- Shared compact title, stage, metrics, fullscreen control, and contained controls are covered by Tasks 1 and 2.
- Persistent dock and internal panel modes are covered by Task 2.
- Foundation capability exclusions are covered by Task 3.
- Desktop, 390px, fullscreen, keyboard, overflow, lint, build, and graph verification are covered by Task 4.
- Scientific models, lab routing, and save behavior are intentionally untouched and verified in Task 3.

### Placeholder Scan

This plan contains no `TBD`, `TODO`, deferred implementation marker, or undefined interface name.

### Type Consistency

The plan preserves the existing `persistentControls?: boolean` public prop and introduces only local booleans in `SharedSimulationShell`; no caller type changes are required.
