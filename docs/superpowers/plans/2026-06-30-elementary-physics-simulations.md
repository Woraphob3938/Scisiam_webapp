> Historical implementation plan from 2026-06-30. Read the active documentation and current source code before reusing any step.

# Elementary Physics Simulations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver independent, saved, accessible simulations for `simple-circuits`, `floating-and-sinking`, and `magnet-exploration` with three guided missions and free exploration.

**Architecture:** Put deterministic science calculations in one small pure TypeScript module so Node can test known cases without rendering React. Build one focused React component per lab, each composed with `SharedSimulationShell`; integrate all three through the existing direct simulation registry, route map, metadata, and save-key registry.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, inline SVG, Lucide icons, Node test runner, Supabase experiment sync.

## Global Constraints

- Reuse `SharedSimulationShell`, existing detail data, and `saveExperimentAndSync`.
- Keep Thai as the primary learning language and preserve existing English lab titles.
- Use no new dependency, database schema, scoring system, or general-purpose simulation framework.
- Never route an unsupported id to another lab.
- Meet WCAG 2.1 AA basics, 44px touch targets, keyboard operation, reduced decorative motion, and responsive layout at 390px.
- Keep each logged trial list bounded to 12 rows.
- Preserve unrelated dirty-worktree changes.

---

### Task 1: Add Tested Elementary Physics Models

**Files:**
- Create: `src/lib/simulations/elementaryPhysics.ts`
- Create: `tests/elementary-physics-models.test.mjs`

**Interfaces:**
- Produces: `calculateSimpleCircuit(cellCount, wireConnected, switchClosed, resistanceOhm?)`
- Produces: `calculateBuoyancy(massKg, displacedVolumeM3, waterDensityKgM3?)`
- Produces: `calculateMagneticInteraction(leftPole, rightPole, distanceCm)`
- Produces: `isMagneticallyAttracted(material)`

- [ ] **Step 1: Write failing known-case tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBuoyancy,
  calculateMagneticInteraction,
  calculateSimpleCircuit,
  isMagneticallyAttracted,
} from "../src/lib/simulations/elementaryPhysics.ts";

test("elementary circuit needs a closed path", () => {
  assert.equal(calculateSimpleCircuit(1, false, true).currentAmp, 0);
  assert.equal(calculateSimpleCircuit(1, true, false).currentAmp, 0);
  assert.equal(calculateSimpleCircuit(1, true, true).currentAmp, 0.25);
  assert.equal(calculateSimpleCircuit(2, true, true).currentAmp, 0.5);
});

test("buoyancy compares weight with displaced water", () => {
  assert.equal(calculateBuoyancy(0.05, 0.0001).outcome, "float");
  assert.equal(calculateBuoyancy(0.2, 0.00005).outcome, "sink");
});

test("magnet poles and materials follow elementary rules", () => {
  assert.equal(calculateMagneticInteraction("N", "S", 10).relation, "attract");
  assert.equal(calculateMagneticInteraction("N", "N", 10).relation, "repel");
  assert.ok(calculateMagneticInteraction("N", "S", 5).strength > calculateMagneticInteraction("N", "S", 20).strength);
  assert.equal(isMagneticallyAttracted("iron"), true);
  assert.equal(isMagneticallyAttracted("aluminum"), false);
});
```

- [ ] **Step 2: Run the tests and confirm RED**

Run: `node --experimental-strip-types --test tests/elementary-physics-models.test.mjs`

Expected: FAIL because `src/lib/simulations/elementaryPhysics.ts` does not exist.

- [ ] **Step 3: Implement the pure models**

```ts
export type MagneticPole = "N" | "S";
export type TestMaterial = "iron" | "aluminum" | "wood" | "plastic";

export function calculateSimpleCircuit(
  cellCount: 1 | 2,
  wireConnected: boolean,
  switchClosed: boolean,
  resistanceOhm = 6,
) {
  const voltageVolt = cellCount * 1.5;
  const isClosed = wireConnected && switchClosed;
  const currentAmp = isClosed ? voltageVolt / resistanceOhm : 0;
  const powerWatt = voltageVolt * currentAmp;
  return { voltageVolt, currentAmp, powerWatt, brightness: Math.min(1, powerWatt / 1.5), isClosed };
}

export function calculateBuoyancy(massKg: number, displacedVolumeM3: number, waterDensityKgM3 = 1000) {
  const gravity = 9.81;
  const weightNewton = massKg * gravity;
  const buoyantForceNewton = waterDensityKgM3 * displacedVolumeM3 * gravity;
  const averageDensityKgM3 = massKg / displacedVolumeM3;
  return {
    weightNewton,
    buoyantForceNewton,
    averageDensityKgM3,
    outcome: buoyantForceNewton >= weightNewton ? "float" as const : "sink" as const,
  };
}

export function calculateMagneticInteraction(leftPole: MagneticPole, rightPole: MagneticPole, distanceCm: number) {
  const safeDistance = Math.max(2, distanceCm);
  return {
    relation: leftPole === rightPole ? "repel" as const : "attract" as const,
    strength: Math.round(100 / (1 + (safeDistance / 6) ** 2)),
  };
}

export function isMagneticallyAttracted(material: TestMaterial) {
  return material === "iron";
}
```

- [ ] **Step 4: Run the focused tests and confirm GREEN**

Run: `node --experimental-strip-types --test tests/elementary-physics-models.test.mjs`

Expected: 3 tests pass.

- [ ] **Step 5: Commit the model**

```powershell
git add src/lib/simulations/elementaryPhysics.ts tests/elementary-physics-models.test.mjs
git commit -m "test: add elementary physics models"
```

---

### Task 2: Add Ready-Lab Regression Expectations

**Files:**
- Modify: `tests/scisiam-regressions.test.mjs`

**Interfaces:**
- Consumes: the three lab ids and component filenames from the design spec.
- Produces: a regression gate covering metadata, route dispatch, readiness, save keys, shell integration, SVG accessibility, mission copy, and model imports.

- [ ] **Step 1: Split the existing placeholder test and add ready-lab assertions**

Add `elementary physics labs have dedicated interactive simulations` with this table:

```js
const elementaryPhysicsSimulations = [
  ["simple-circuits", "SimpleCircuitsSimulation", "calculateSimpleCircuit"],
  ["floating-and-sinking", "FloatingSinkingSimulation", "calculateBuoyancy"],
  ["magnet-exploration", "MagnetExplorationSimulation", "calculateMagneticInteraction"],
];
```

For each entry assert that status is empty, the direct registry and save registry contain the id, the component file exists, the route dynamically imports and maps the component, and source contains `SharedSimulationShell`, `saveExperimentAndSync`, `aria-labelledby`, `ภารกิจ`, and its pure model function. Remove these three ids from `elementaryLabs` in the placeholder test and change its expected length from 9 to 6.

- [ ] **Step 2: Run the regression and confirm RED**

Run: `node --test tests/scisiam-regressions.test.mjs`

Expected: FAIL because the components, ready registrations, route entries, and save keys do not exist.

- [ ] **Step 3: Leave the failing test uncommitted until Tasks 3-6 complete**

This preserves the RED gate while each component is built.

---

### Task 3: Build Simple Circuits Simulation

**Files:**
- Create: `src/components/labs/simulation/SimpleCircuitsSimulation.tsx`

**Interfaces:**
- Consumes: `calculateSimpleCircuit` and `SharedSimulationShell`.
- Produces: default React component `SimpleCircuitsSimulation`.

- [ ] **Step 1: Implement state and evidence-based missions**

Use states `cellCount`, `wireConnected`, `switchClosed`, and `loggedRuns`. Derive the model with `useMemo`. Track mission evidence as booleans that become true after observing: a closed powered circuit, an open/broken zero-current circuit, and closed-circuit logs for both cell counts. Keep logs with `prev => [...prev, run].slice(-12)`.

- [ ] **Step 2: Implement the accessible SVG stage**

Use `viewBox="0 0 760 360"`, `<title>` and `<desc>` linked through `aria-labelledby`, unique gradient/filter ids from `useId`, battery cells, complete/broken wire segment, a switch blade, bulb and filament, and current markers only when `isClosed`. Represent brightness with filament color/glow plus explicit Thai status text; do not rely on glow alone.

- [ ] **Step 3: Compose the full shell**

Pass `accent="orange"`, the three mission steps, voltage/current/relative-brightness metrics, controls for wire/switch/cells, a logged-current comparison graph, a semantic result table, a Thai theory panel explaining `I = V / R`, compact controls, drawer summary, and `progressPercent` based on completed evidence.

- [ ] **Step 4: Wire save behavior**

Call `saveExperimentAndSync` with local key `scisiam_saved_simple_circuits_experiment`, variables, live values, graph points, table rows, mission summary, and no score. Require at least one logged row before saving and return to `/labs/simple-circuits` after success.

- [ ] **Step 5: Run focused quality checks**

Run: `npx eslint src/components/labs/simulation/SimpleCircuitsSimulation.tsx src/lib/simulations/elementaryPhysics.ts`

Expected: exit 0.

---

### Task 4: Build Floating And Sinking Simulation

**Files:**
- Create: `src/components/labs/simulation/FloatingSinkingSimulation.tsx`

**Interfaces:**
- Consumes: `calculateBuoyancy` and `SharedSimulationShell`.
- Produces: default React component `FloatingSinkingSimulation`.

- [ ] **Step 1: Define the material catalog and mission evidence**

Use a constant catalog with wood `(0.06 kg, 0.0001 m3)`, plastic `(0.08 kg, 0.0001 m3)`, steel `(0.20 kg, 0.00005 m3)`, clay ball `(0.12 kg, 0.00008 m3)`, and clay boat `(0.12 kg, 0.00018 m3)`. Store selected material, clay shape, prediction, tested flag, and at most 12 logged rows. Complete missions only after a correct floating test, a correct sinking test, and testing both clay shapes with different outcomes.

- [ ] **Step 2: Implement the SVG tank and result motion**

Use `viewBox="0 0 760 360"`, accessible title/description, water gradient, stable waterline, selected object, downward weight arrow, upward buoyancy arrow, density labels, and a short transform/opacity transition after testing. Place floating objects at the waterline and sinking objects near the tank floor; reduced motion removes decorative ripples without changing the result.

- [ ] **Step 3: Compose controls, comparison, and save flow**

Provide material cards, float/sink prediction buttons, clay shape control, test/reset/log actions, density metrics, a density-vs-water reference plot, semantic table, mission progress, and free exploration. Save through `scisiam_saved_floating_sinking_experiment` with prediction, setup, forces, densities, outcomes, and logged rows.

- [ ] **Step 4: Run focused quality checks**

Run: `npx eslint src/components/labs/simulation/FloatingSinkingSimulation.tsx`

Expected: exit 0.

---

### Task 5: Build Magnet Exploration Simulation

**Files:**
- Create: `src/components/labs/simulation/MagnetExplorationSimulation.tsx`

**Interfaces:**
- Consumes: `calculateMagneticInteraction`, `isMagneticallyAttracted`, and `SharedSimulationShell`.
- Produces: default React component `MagnetExplorationSimulation`.

- [ ] **Step 1: Implement pole, distance, material, and mission state**

Use states `facingPole`, `distanceCm`, `testMode`, `material`, and `loggedRuns`. Mission evidence requires observing attraction, repulsion, and testing iron plus at least one non-attracted material. Treat magnetic strength as a unitless classroom indicator.

- [ ] **Step 2: Implement the accessible magnetic SVG**

Use `viewBox="0 0 760 360"`, title/description, two bar magnets with text N/S labels, distance guide, directional field paths, and attract/repel force arrows. In material mode show one magnet and the selected object. Always include explicit Thai text for attraction, repulsion, or no strong attraction; field-line decoration must respect reduced motion.

- [ ] **Step 3: Compose controls, graph/table, and save flow**

Provide pole rotation, distance slider/number input, magnet/material mode, material selection, reset/log buttons, relation and strength metrics, strength-by-distance graph or material-response comparison, mission progress, and result table. Save through `scisiam_saved_magnet_exploration_experiment` with setup, relation/material response, strength indicator, and rows.

- [ ] **Step 4: Run focused quality checks**

Run: `npx eslint src/components/labs/simulation/MagnetExplorationSimulation.tsx`

Expected: exit 0.

---

### Task 6: Register And Route All Three Labs

**Files:**
- Modify: `src/data/labs.ts`
- Modify: `src/data/labSimulationRegistry.ts`
- Modify: `src/data/labSavedExperiments.ts`
- Modify: `src/app/labs/[id]/simulation/page.tsx`
- Modify: `tests/scisiam-regressions.test.mjs`

**Interfaces:**
- Consumes: three default simulation components from Tasks 3-5.
- Produces: ready cards, detail-page start actions, direct route dispatch, save-key coverage, and passing regression gates.

- [ ] **Step 1: Mark metadata ready and add registries**

Set each metadata `status` to `""`. Append the three ids to `directSimulationLabIds`. Add exact save mappings:

```ts
"simple-circuits": "scisiam_saved_simple_circuits_experiment",
"floating-and-sinking": "scisiam_saved_floating_sinking_experiment",
"magnet-exploration": "scisiam_saved_magnet_exploration_experiment",
```

- [ ] **Step 2: Add dynamic imports and direct map entries**

Add `SimpleCircuitsSimulation`, `FloatingSinkingSimulation`, and `MagnetExplorationSimulation` dynamic imports next to the existing elementary Physics imports, then map their ids in `simulationComponents`.

- [ ] **Step 3: Run model and regression tests**

Run: `node --experimental-strip-types --test tests/elementary-physics-models.test.mjs`

Expected: 3 tests pass.

Run: `node --test tests/scisiam-regressions.test.mjs`

Expected: all regression tests pass, including ready-component and save-key assertions.

- [ ] **Step 4: Commit the feature implementation**

```powershell
git add src/lib/simulations/elementaryPhysics.ts tests/elementary-physics-models.test.mjs tests/scisiam-regressions.test.mjs src/components/labs/simulation/SimpleCircuitsSimulation.tsx src/components/labs/simulation/FloatingSinkingSimulation.tsx src/components/labs/simulation/MagnetExplorationSimulation.tsx src/data/labs.ts src/data/labSimulationRegistry.ts src/data/labSavedExperiments.ts 'src/app/labs/[id]/simulation/page.tsx'
git commit -m "feat: add elementary physics simulations"
```

---

### Task 7: Full Verification And Browser QA

**Files:**
- Modify only files from Tasks 1-6 when verification reveals a scoped defect.

**Interfaces:**
- Consumes: all completed simulations and integrations.
- Produces: verified desktop/mobile simulations with no unrelated changes.

- [ ] **Step 1: Run repository verification**

```powershell
npm test
npm run lint
npm run build
rg -n --hidden -g '!node_modules' -g '!.next' -g '!dist' -g '!.git' "AIza|sk-proj|GEMINI_API_KEY\s*="
```

Expected: tests, lint, and build exit 0; secret scan returns no committed secret.

- [ ] **Step 2: Run browser QA**

Inspect these routes at 390x844, 768x1024, and desktop:

- `/labs/simple-circuits` and `/labs/simple-circuits/simulation`
- `/labs/floating-and-sinking` and `/labs/floating-and-sinking/simulation`
- `/labs/magnet-exploration` and `/labs/magnet-exploration/simulation`

For each simulation, complete all three missions, enter free exploration, log one result, trigger save, test reset, inspect fullscreen, and check console/hydration errors, horizontal overflow, overlap, blank SVG pixels, focus visibility, and keyboard operation.

- [ ] **Step 3: Update the graph and inspect final diff**

Run: `graphify update .`

Run: `git diff --check` and `git status --short`

Expected: graph update succeeds, diff check exits 0, and only intended feature files plus pre-existing unrelated work remain changed.
