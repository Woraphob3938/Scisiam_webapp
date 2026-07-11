> Historical implementation plan from 2026-07-02. Read the active documentation and current source code before reusing any step.

# Login Entry, Account History, and Elementary Chemistry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send the site root to login, isolate authenticated history from stale browser records, and ship three deterministic, saveable elementary chemistry simulations.

**Architecture:** Keep routing and history fixes in their existing owners. Add one pure chemistry model module for testable scientific rules, while each lab owns its React state, SVG stage, controls, graph, table, and save payload through `SharedSimulationShell` and `saveExperimentAndSync`.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript, Tailwind CSS v4, lucide-react, Supabase, Node test runner.

## Global Constraints

- Preserve unrelated dirty working-tree changes and stage only named files.
- Do not add dependencies or a shared UI simulation engine.
- Supabase is authoritative for authenticated history; localStorage is fallback-only.
- These three simulations use open exploration with no mission/checkpoint flow.
- Use deterministic/fixed-step updates, bounded samples, effect cleanup, and `saveExperimentAndSync`.
- Keep metadata, readiness, route, and save-key registries aligned.
- SVGs need title/description, unique ids, keyboard focus, 44 px controls, responsive layout, and reduced-motion behavior.

---

### Task 1: Lock Entry and History Behavior With Tests

**Files:**
- Create: `tests/auth-entry-history.test.mjs`
- Modify: `tests/product-consolidation.test.mjs`
- Modify: `tests/scisiam-regressions.test.mjs`

**Interfaces:**
- Consumes: `src/app/page.tsx` and `LearningHistoryPage.tsx` source behavior.
- Produces: regression expectations for `/login` and cloud-only history.

- [ ] **Step 1: Write the focused failing test**

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(rootDir, path), "utf8");

test("site root redirects directly to login", () => {
  const source = read("src/app/page.tsx");
  assert.match(source, /redirect\("\/login"\)/);
  assert.doesNotMatch(source, /redirect\("\/labs"\)/);
});

test("authenticated history excludes device-local runs", () => {
  const source = read("src/components/history/LearningHistoryPage.tsx");
  assert.match(source, /nextSource === "cloud"\s*\?\s*mapCloudHistoryRecords\(nextSnapshot\.recentRuns\)\s*:\s*sortHistoryRecords\(localRecords\)/);
  assert.doesNotMatch(source, /mergeHistoryRecords\(nextSource === "cloud"[\s\S]*localRecords\)/);
});
```

- [ ] **Step 2: Update duplicate root expectations**

In `tests/product-consolidation.test.mjs` and the existing root test in `tests/scisiam-regressions.test.mjs`, replace only the `/labs` expectation with:

```js
assert.match(source, /redirect\("\/login"\)/);
```

- [ ] **Step 3: Confirm the old implementation fails**

Run: `node --test tests/auth-entry-history.test.mjs tests/product-consolidation.test.mjs`

Expected: FAIL because the root still redirects to `/labs` and history still merges both sources.

---

### Task 2: Implement Login Entry and Account-Owned History

**Files:**
- Modify: `src/app/page.tsx:1-5`
- Modify: `src/components/history/LearningHistoryPage.tsx:203-255`
- Test: `tests/auth-entry-history.test.mjs`

**Interfaces:**
- Consumes: `LearningRunSnapshot`, `HistoryRecord`, `loadSupabaseLearningSnapshot()`.
- Produces: `sortHistoryRecords(records)` and `mapCloudHistoryRecords(cloudRuns)`.

- [ ] **Step 1: Change the root page**

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
```

- [ ] **Step 2: Replace cross-source merging**

```ts
function sortHistoryRecords(records: HistoryRecord[]) {
  return [...records].sort(
    (a, b) => b.createdAtMs - a.createdAtMs || a.title.localeCompare(b.title),
  );
}

function mapCloudHistoryRecords(cloudRuns: LearningRunSnapshot[]) {
  return sortHistoryRecords(
    cloudRuns.map(mapRunToRecord).filter(Boolean) as HistoryRecord[],
  );
}
```

At the end of `loadHistory()`, use:

```ts
setSnapshot(nextSnapshot);
setRecords(
  nextSource === "cloud"
    ? mapCloudHistoryRecords(nextSnapshot.recentRuns)
    : sortHistoryRecords(localRecords),
);
setSource(nextSource);
setLoading(false);
```

- [ ] **Step 3: Run tests**

Run: `node --test tests/auth-entry-history.test.mjs tests/product-consolidation.test.mjs tests/scisiam-regressions.test.mjs`

Expected: PASS. Authenticated empty cloud history remains empty; local records remain available only in local mode.

- [ ] **Step 4: Commit**

```powershell
git add -- src/app/page.tsx src/components/history/LearningHistoryPage.tsx tests/auth-entry-history.test.mjs tests/product-consolidation.test.mjs tests/scisiam-regressions.test.mjs
git diff --cached
git commit -m "fix: isolate account history and start at login"
```

Inspect the staged diff because `tests/scisiam-regressions.test.mjs` already contains preserved work.

---

### Task 3: Add Pure Chemistry Models

**Files:**
- Create: `src/lib/simulations/elementaryChemistry.ts`
- Create: `tests/elementary-chemistry-models.test.mjs`

**Interfaces:**
- Produces: `getMatterPhase`, `getSeparationOutcome`, `calculateDissolutionRate`, `advanceDissolution`.
- Consumed by: Tasks 4-6.

- [ ] **Step 1: Write model tests**

```js
import assert from "node:assert/strict";
import test from "node:test";
import { advanceDissolution, calculateDissolutionRate, getMatterPhase, getSeparationOutcome } from "../src/lib/simulations/elementaryChemistry.ts";

test("water phase uses simplified normal-pressure boundaries", () => {
  assert.equal(getMatterPhase(-1).id, "solid");
  assert.equal(getMatterPhase(0).id, "liquid");
  assert.equal(getMatterPhase(99).id, "liquid");
  assert.equal(getMatterPhase(100).id, "gas");
});

test("preferred separation methods outperform mismatches", () => {
  assert.equal(getSeparationOutcome("iron-sand", "magnet").recoveryPercent, 96);
  assert.equal(getSeparationOutcome("sand-water", "filtration").purityPercent, 94);
  assert.ok(getSeparationOutcome("iron-sand", "filtration").recoveryPercent < 96);
});

test("warmth and stirring increase dissolution rate", () => {
  const cool = calculateDissolutionRate(20, false, 5);
  const warm = calculateDissolutionRate(60, false, 5);
  const stirred = calculateDissolutionRate(60, true, 5);
  assert.ok(warm > cool);
  assert.ok(stirred > warm);
});

test("dissolution advance is deterministic and bounded", () => {
  assert.equal(advanceDissolution(0, 2, 0.5), 1);
  assert.equal(advanceDissolution(4.9, 2, 0.5, 5), 5);
});
```

- [ ] **Step 2: Confirm missing module failure**

Run: `node --test tests/elementary-chemistry-models.test.mjs`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the model**

```ts
export type MatterPhaseId = "solid" | "liquid" | "gas";
export type MixtureType = "iron-sand" | "sand-water" | "salt-water" | "gravel-sand";
export type SeparationMethod = "magnet" | "filtration" | "evaporation" | "sieving";

const phases = {
  solid: { id: "solid", thaiLabel: "ของแข็ง", spacing: "ชิดและเป็นระเบียบ", motionLevel: 0.2 },
  liquid: { id: "liquid", thaiLabel: "ของเหลว", spacing: "ชิดแต่เลื่อนไหล", motionLevel: 0.55 },
  gas: { id: "gas", thaiLabel: "แก๊ส", spacing: "ห่างและกระจาย", motionLevel: 1 },
} as const;

export function getMatterPhase(temperatureC: number) {
  if (temperatureC < 0) return phases.solid;
  if (temperatureC < 100) return phases.liquid;
  return phases.gas;
}

const preferredMethods: Record<MixtureType, SeparationMethod> = {
  "iron-sand": "magnet", "sand-water": "filtration",
  "salt-water": "evaporation", "gravel-sand": "sieving",
};

const preferredResults = {
  "iron-sand": { recoveryPercent: 96, purityPercent: 95 },
  "sand-water": { recoveryPercent: 92, purityPercent: 94 },
  "salt-water": { recoveryPercent: 88, purityPercent: 90 },
  "gravel-sand": { recoveryPercent: 90, purityPercent: 92 },
} as const;

export function getSeparationOutcome(mixture: MixtureType, method: SeparationMethod) {
  const isPreferred = preferredMethods[mixture] === method;
  return {
    isPreferred,
    recoveryPercent: isPreferred ? preferredResults[mixture].recoveryPercent : 24,
    purityPercent: isPreferred ? preferredResults[mixture].purityPercent : 35,
  };
}

export function calculateDissolutionRate(temperatureC: number, isStirring: boolean, soluteGrams: number) {
  return (0.055 + Math.max(0, temperatureC) * 0.0018) * (isStirring ? 1.75 : 1) / Math.max(1, soluteGrams / 5);
}

export function advanceDissolution(dissolvedGrams: number, rate: number, deltaSeconds: number, totalGrams = Number.POSITIVE_INFINITY) {
  return Math.min(totalGrams, Math.max(0, dissolvedGrams + rate * deltaSeconds));
}
```

- [ ] **Step 4: Pass and commit**

Run: `node --test tests/elementary-chemistry-models.test.mjs`

Expected: 4 tests pass.

```powershell
git add -- src/lib/simulations/elementaryChemistry.ts tests/elementary-chemistry-models.test.mjs
git commit -m "feat: add elementary chemistry models"
```

---

### Task 4: Rebuild States of Matter

**Files:**
- Replace: `src/components/labs/simulation/StatesOfMatterSimulation.tsx`
- Create: `tests/elementary-chemistry-simulations.test.mjs`

**Interfaces:**
- Consumes: `getMatterPhase` and `scisiam_saved_states_of_matter_experiment`.
- Produces: bounded observations, deterministic SVG, graph/table, save payload.

- [ ] **Step 1: Add the component contract test**

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

for (const file of ["StatesOfMatterSimulation.tsx", "MixingAndSeparatingSimulation.tsx", "DissolvingSolutionsSimulation.tsx"]) {
  test(`${file} has a complete open simulation`, () => {
    const source = readFileSync(`src/components/labs/simulation/${file}`, "utf8");
    assert.match(source, /<SharedSimulationShell/);
    assert.match(source, /saveExperimentAndSync/);
    assert.match(source, /aria-labelledby/);
    assert.match(source, /<title id=/);
    assert.match(source, /<desc id=/);
    assert.match(source, /graph=\{/);
    assert.match(source, /table=\{/);
    assert.doesNotMatch(source, /progressValue="0\/1"/);
    assert.doesNotMatch(source, /Math\.random\(\)/);
  });
}
```

- [ ] **Step 2: Confirm all three old files fail the contract**

Run: `node --test tests/elementary-chemistry-simulations.test.mjs`

Expected: FAIL on save, graph/table, accessibility, or random motion.

- [ ] **Step 3: Implement deterministic matter exploration**

Use a fixed module-level 36-particle grid with per-particle phase offsets. Run one RAF only while active, clamp delta to 50 ms, publish elapsed time at most every 100 ms, and derive positions with `useMemo`; do not mutate particle objects. Controls: temperature `-20..120 C`, start/pause, record observation, reset, and clear table. Keep 12 observations.

The SVG uses `viewBox="0 0 760 380"`, `useId`, `role="img"`, `aria-labelledby`, title/description, a chamber, thermometer, and visibly distinct ordered solid, flowing liquid, and dispersed gas arrangements.

- [ ] **Step 4: Add outputs and save**

Graph: observation index versus temperature, with 0 C and 100 C phase boundaries. Table: index, time, temperature, state, spacing. Progress text is `บันทึกแล้ว N ครั้ง`, not a mission count.

```ts
await saveExperimentAndSync({
  localStorageKey: "scisiam_saved_states_of_matter_experiment",
  localPayload: { labId, timestamp: new Date().toISOString(), observations },
  labId, title: "สถานะของสสาร",
  variables: { temperatureC },
  liveValues: { elapsedSeconds, phase: phase.id, motionLevel: phase.motionLevel },
  graphPoints: observations,
  tableRows: observations,
  summary: { observationsCount: observations.length, latestPhase: phase.thaiLabel },
  durationSeconds: Math.round(elapsedSeconds),
});
```

Require one observation before save and expose saving/disabled state. State that phase boundaries are a simplified water model at normal pressure.

- [ ] **Step 5: Test, lint, commit**

```powershell
node --test tests/elementary-chemistry-models.test.mjs tests/elementary-chemistry-simulations.test.mjs
npx eslint src/components/labs/simulation/StatesOfMatterSimulation.tsx
git add -- src/components/labs/simulation/StatesOfMatterSimulation.tsx tests/elementary-chemistry-simulations.test.mjs
git commit -m "feat: rebuild states of matter simulation"
```

Expected: States passes its contract; the two unfinished replacements still fail until Tasks 5-6.

---

### Task 5: Rebuild Mixing and Separating

**Files:**
- Replace: `src/components/labs/simulation/MixingAndSeparatingSimulation.tsx`
- Test: `tests/elementary-chemistry-simulations.test.mjs`

**Interfaces:**
- Consumes: `MixtureType`, `SeparationMethod`, `getSeparationOutcome`.
- Produces: bounded trial comparison and apparatus-specific SVG.

- [ ] **Step 1: Implement stable trials**

Define `SeparationTrial` with index, mixture labels, method labels, recovery, purity, and preferred status. Use one RAF with elapsed time to complete in 3 seconds independent of frame rate. Append exactly one result when progress reaches 100. Keep 12 trials. Reset cancels the current run; clear-table removes history.

- [ ] **Step 2: Implement the professional SVG stage**

Use one accessible `760x380` lab bench SVG and render the selected apparatus: magnet lifting iron, filter retaining sand, evaporating dish leaving salt, or sieve retaining gravel. Non-preferred methods still animate but leave visibly mixed material and return low model values.

- [ ] **Step 3: Add graph, table, guidance, and save**

Graph: paired recovery/purity bars. Table: index, mixture, method, recovery, purity, summary. Explain the physical property used by each method.

```ts
await saveExperimentAndSync({
  localStorageKey: "scisiam_saved_mixing_separating_experiment",
  localPayload: { labId, timestamp: new Date().toISOString(), trials },
  labId, title: "การผสมและแยกสาร",
  variables: { mixture, method },
  liveValues: { progress, ...currentOutcome },
  graphPoints: trials.map(({ index, recoveryPercent, purityPercent }) => ({ index, recoveryPercent, purityPercent })),
  tableRows: trials,
  summary: { trialsCount: trials.length, preferredCount: trials.filter((trial) => trial.isPreferred).length },
  durationSeconds: null,
});
```

- [ ] **Step 4: Test, lint, commit**

```powershell
node --test tests/elementary-chemistry-models.test.mjs tests/elementary-chemistry-simulations.test.mjs
npx eslint src/components/labs/simulation/MixingAndSeparatingSimulation.tsx
git add -- src/components/labs/simulation/MixingAndSeparatingSimulation.tsx
git commit -m "feat: rebuild mixing and separating simulation"
```

Expected: States and Mixing pass; Dissolving remains failing.

---

### Task 6: Rebuild Dissolving and Solutions

**Files:**
- Replace: `src/components/labs/simulation/DissolvingSolutionsSimulation.tsx`
- Test: `tests/elementary-chemistry-simulations.test.mjs`

**Interfaces:**
- Consumes: `calculateDissolutionRate`, `advanceDissolution`.
- Produces: bounded graph samples, completed trials, deterministic SVG, save payload.

- [ ] **Step 1: Implement fixed-step dissolution**

Track elapsed time and dissolved mass in refs. During RAF, clamp frame delta to 50 ms and advance in fixed 0.05-second steps. Publish UI at most every 100 ms and graph points every 0.5 simulated seconds. Keep 80 points and 12 trials. Stop and log once at 100 percent.

- [ ] **Step 2: Implement controls and SVG**

Controls: 1-10 g solute, 10-80 C water, stirring toggle, start/pause, reset trial, clear table. Lock variables after a trial starts until reset.

The accessible `760x380` SVG shows a beaker, thermometer, deterministic crystals shrinking with remaining mass, solution tint increasing, and a spoon rotating only while stirring. Derive bubbles/flow lines from stable arrays; no `Math.random()`. Reduced motion stops decorative movement without stopping numeric results.

- [ ] **Step 3: Add graph, table, science copy, and save**

Graph: elapsed seconds versus dissolved percent. Table: index, temperature, solute, stirring, completion time, dissolved percent. State clearly that temperature and stirring affect rate in this simplified model; do not claim stirring increases maximum solubility.

```ts
await saveExperimentAndSync({
  localStorageKey: "scisiam_saved_dissolving_solutions_experiment",
  localPayload: { labId, timestamp: new Date().toISOString(), points, trials },
  labId, title: "การละลายและสารละลาย",
  variables: { temperatureC, soluteGrams, isStirring },
  liveValues: { elapsedSeconds, dissolvedGrams, dissolvedPercent, remainingGrams },
  graphPoints: points,
  tableRows: trials,
  summary: { trialsCount: trials.length, latestDissolvedPercent: dissolvedPercent },
  durationSeconds: Math.round(elapsedSeconds),
});
```

- [ ] **Step 4: Test, lint, commit**

```powershell
node --test tests/elementary-chemistry-models.test.mjs tests/elementary-chemistry-simulations.test.mjs
npx eslint src/components/labs/simulation/DissolvingSolutionsSimulation.tsx
git add -- src/components/labs/simulation/DissolvingSolutionsSimulation.tsx tests/elementary-chemistry-simulations.test.mjs
git commit -m "feat: rebuild dissolving solutions simulation"
```

Expected: all model and simulation contract tests pass.

---

### Task 7: Align Registries and Guard Against Wrong-Lab Routing

**Files:**
- Verify/modify: `src/app/labs/[id]/simulation/page.tsx`
- Verify/modify: `src/data/labs.ts`
- Verify/modify: `src/data/labSimulationRegistry.ts`
- Verify/modify: `src/data/labSavedExperiments.ts`
- Modify: `tests/scisiam-regressions.test.mjs`

**Interfaces:**
- Consumes: three completed simulation components.
- Produces: matching ready metadata, routes, and save keys.

- [ ] **Step 1: Add registry assertions**

Add a regression that loops over:

```js
const targets = [
  ["states-of-matter", "StatesOfMatterSimulation"],
  ["mixing-and-separating", "MixingAndSeparatingSimulation"],
  ["dissolving-solutions", "DissolvingSolutionsSimulation"],
];
```

For each, assert `status: ""`, direct-registry membership, save-key membership, and exact route-map component. Keep the existing placeholder test limited to `acids-bases-around-us`, `heating-cooling-materials`, and `physical-chemical-changes`.

- [ ] **Step 2: Verify and test**

```powershell
rg -n 'states-of-matter|mixing-and-separating|dissolving-solutions' src/data/labs.ts src/data/labSimulationRegistry.ts src/data/labSavedExperiments.ts src/app/labs/[id]/simulation/page.tsx
node --test tests/scisiam-regressions.test.mjs
```

Expected: each id is ready once, has one save key, maps to its own component, and no unsupported lab falls back to it.

- [ ] **Step 3: Commit only necessary registry work**

```powershell
git add -- src/app/labs/[id]/simulation/page.tsx src/data/labs.ts src/data/labSimulationRegistry.ts src/data/labSavedExperiments.ts tests/scisiam-regressions.test.mjs
git diff --cached
git commit -m "feat: register elementary chemistry simulations"
```

Skip this commit if the preserved working-tree edits already satisfy the task and no registry file changes.

---

### Task 8: Full Verification and Responsive QA

**Files:**
- Verify all files from Tasks 1-7.
- Update locally: `graphify-out/` without staging it.

**Interfaces:**
- Consumes: complete implementation.
- Produces: verified build and browser behavior.

- [ ] **Step 1: Run automated verification**

```powershell
npm test
npm run lint
npm run build
```

Expected: all exit 0 with no hydration, type, lint, or registry errors.

- [ ] **Step 2: Scan secrets**

Run: `rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="`

Expected: no committed secret values.

- [ ] **Step 3: Start the dev server and inspect routes**

Run: `npm run dev`

Inspect `/`, `/login`, `/profile?tab=history`, and both detail/simulation pages for all three target lab ids. Check desktop and 390 px mobile.

Exercise controls, start/pause, reset, logging, graph/table, empty-save guard, successful save, fullscreen, and reduced motion. Confirm no horizontal overflow, covered actions, console errors, or hydration warnings. Verify a new cloud account has no stale local history.

- [ ] **Step 4: Update graph and inspect final state**

```powershell
graphify update .
git status --short
git diff --check
git log -6 --oneline
```

Expected: graph update succeeds, no whitespace errors, unrelated files remain intact, and generated output/log/cache/environment files are unstaged.

---

## Self-Review

- Spec coverage: entry routing, account ownership, three open simulations, deterministic timing, outputs, save flow, accessibility, registry integrity, and responsive QA all have explicit tasks.
- Placeholder scan: every task names concrete files, interfaces, commands, code, and expected results.
- Type consistency: model exports and simulation record fields use the same names from definition through tests and save payloads.
