# Chemistry SVG Experiment Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Galvanic Cell, Chemical Reaction Rates, and Solubility Product SVG stages so each shows a clear experiment animation whenever the learner presses run.

**Architecture:** Keep the shared calculation, graph, table, save flow, and `SharedSimulationShell` intact. Add three focused scene components inside `ChemistryConceptSimulation.tsx`, select them from `ChemistryScene`, and use an incrementing `runToken` plus keyed SVG groups to replay lightweight CSS animations without timer-driven React updates.

**Tech Stack:** Next.js 16, React 19, TypeScript, inline SVG, CSS keyframes, Node test runner

## Global Constraints

- No numerical values, axes, plots, equations, or numeric meters inside the three rebuilt SVG scenes.
- Keep the surrounding controls, metrics, result graph, result table, theory, save flow, and shared simulation shell unchanged.
- Use short Thai labels only when they directly clarify apparatus or direction.
- Keep the apparatus legible at a 390 px viewport width.
- Respect reduced-motion preferences and do not add dependencies.
- Do not commit unless the user explicitly requests it.

---

### Task 1: Add regression guards for the three experiment scenes

**Files:**
- Create: `tests/chemistry-concept-scenes.test.mjs`
- Test: `tests/chemistry-concept-scenes.test.mjs`

**Interfaces:**
- Consumes: source text from `src/components/labs/simulation/ChemistryConceptSimulation.tsx`
- Produces: regression requirements for `GalvanicExperimentScene`, `ReactionRateExperimentScene`, `SolubilityExperimentScene`, and `runToken`

- [ ] **Step 1: Write the failing source regression tests**

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(
  path.join(root, "src/components/labs/simulation/ChemistryConceptSimulation.tsx"),
  "utf8",
);

test("chemistry concept labs use dedicated replayable experiment scenes", () => {
  assert.match(source, /function GalvanicExperimentScene\(/);
  assert.match(source, /function ReactionRateExperimentScene\(/);
  assert.match(source, /function SolubilityExperimentScene\(/);
  assert.match(source, /const \[runToken, setRunToken\] = useState\(0\)/);
  assert.match(source, /onRun=\{\(\) => setRunToken\(\(token\) => token \+ 1\)\}/);
  assert.match(source, /runLabel="เริ่มทดลอง"/);
});

test("rebuilt scenes expose the observable chemistry and reduced-motion fallback", () => {
  assert.match(source, /electron-flow/);
  assert.match(source, /reaction-collision/);
  assert.match(source, /precipitate-settle/);
  assert.match(source, /prefers-reduced-motion: reduce/);
});

test("removed in-scene graph and numeric result content stays removed", () => {
  const rebuiltScenes = source.slice(
    source.indexOf("function GalvanicExperimentScene("),
    source.indexOf("function ChemistryScene("),
  );
  assert.doesNotMatch(rebuiltScenes, /result\./);
  assert.doesNotMatch(rebuiltScenes, /โปรไฟล์พลังงาน/);
  assert.doesNotMatch(rebuiltScenes, /<text[^>]*>\s*\{[^}]*value/);
});
```

- [ ] **Step 2: Run the focused test and verify the new contract fails**

Run: `node --test tests/chemistry-concept-scenes.test.mjs`

Expected: FAIL because the dedicated scene functions and `runToken` do not exist yet.

---

### Task 2: Build the replayable SVG experiments

**Files:**
- Modify: `src/components/labs/simulation/ChemistryConceptSimulation.tsx:518-654`
- Test: `tests/chemistry-concept-scenes.test.mjs`

**Interfaces:**
- Consumes: `labId: ChemistryConceptLabId` and `runToken: number`
- Produces: `GalvanicExperimentScene({ runToken })`, `ReactionRateExperimentScene({ runToken })`, `SolubilityExperimentScene({ runToken })`, and `ChemistryScene({ labId, result, runToken })`

- [ ] **Step 1: Add shared SVG motion styles and focused scene signatures**

Add a small `ExperimentMotionStyles` component with named classes and a reduced-motion media query. Each animated scene uses the current token as a group key:

```tsx
function ExperimentMotionStyles() {
  return (
    <style>{`
      .electron-flow { animation: electron-flow 1.4s linear 3 both; }
      .reaction-collision { animation: reaction-collision 1.8s ease-in-out both; }
      .precipitate-settle { animation: precipitate-settle 1.8s ease-in both; }
      @media (prefers-reduced-motion: reduce) {
        .electron-flow, .reaction-collision, .precipitate-settle {
          animation-duration: 0.01ms !important;
          animation-delay: 0ms !important;
          animation-iteration-count: 1 !important;
        }
      }
    `}</style>
  );
}

type ExperimentSceneProps = { runToken: number };
```

Implement `GalvanicExperimentScene`, `ReactionRateExperimentScene`, and `SolubilityExperimentScene` with `ExperimentSceneProps`. The galvanic scene contains two open beakers, Zn/Cu electrodes, a U-shaped salt bridge, an external wire, three electron dots, four salt-bridge ion dots, an anode erosion overlay, and a cathode deposit overlay. The rate scene contains one reaction vessel, four green reactants, four violet reactants, a centered collision flash, and four bonded product pairs. The solubility scene contains a dropper, one droplet, a beaker, twelve separated ion dots, and eight solid precipitate particles at the bottom. Use `runToken === 0` for a clear idle apparatus and `key={runToken}` for each animated group so pressing run again restarts the motion.

- [ ] **Step 2: Replace only the three target branches in `ChemistryScene`**

Change the scene interface and dispatch while leaving Avogadro, electrolysis, and colligative-property branches unchanged:

```tsx
{isGalvanic ? (
  <GalvanicExperimentScene runToken={runToken} />
) : isKinetics ? (
  <ReactionRateExperimentScene runToken={runToken} />
) : isKsp ? (
  <SolubilityExperimentScene runToken={runToken} />
) : isAvogadro ? (
```

The existing Avogadro, electrolysis, and colligative JSX continues immediately after the last shown line without visual or behavioral changes.

- [ ] **Step 3: Replace the one-shot boolean with a replay token**

```tsx
const [runToken, setRunToken] = useState(0);

const handleReset = () => {
  setPrimary(config.primary.defaultValue);
  setSecondary(config.secondary.defaultValue);
  setRunToken(0);
};

<SharedSimulationShell
  statusLabel={runToken > 0 ? "กำลังแสดงผลทดลอง" : "พร้อมทดลอง"}
  scene={<ChemistryScene labId={labId} result={result} runToken={runToken} />}
  onRun={() => setRunToken((token) => token + 1)}
  runLabel="เริ่มทดลอง"
  // all other props unchanged
/>
```

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `node --test tests/chemistry-concept-scenes.test.mjs`

Expected: PASS with 3 passing tests.

---

### Task 3: Verify integration and refresh the knowledge graph

**Files:**
- Verify: `src/components/labs/simulation/ChemistryConceptSimulation.tsx`
- Verify: `tests/chemistry-concept-scenes.test.mjs`
- Update: `graphify-out/`

**Interfaces:**
- Consumes: completed experiment scenes and existing simulation routes
- Produces: fresh test, lint, build, and graph evidence

- [ ] **Step 1: Run the relevant regression tests**

Run: `node --test tests/chemistry-concept-scenes.test.mjs tests/newtons-cooling-controls.test.mjs`

Expected: both test files pass with no failures.

- [ ] **Step 2: Run project verification**

Run: `npm test`

Expected: exit code 0 and no failing tests.

Run: `npm run lint`

Expected: exit code 0 and no lint errors.

Run: `npm run build`

Expected: exit code 0 and all routes compile.

- [ ] **Step 3: Update the project knowledge graph**

Run: `graphify update .`

Expected: graph update completes successfully; generated graph files are not committed unless requested.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff -- src/components/labs/simulation/ChemistryConceptSimulation.tsx tests/chemistry-concept-scenes.test.mjs docs/superpowers/specs/2026-08-02-chemistry-svg-scenes-design.md docs/superpowers/plans/2026-08-02-chemistry-svg-scenes.md`

Expected: only the approved SVG redesign, replay interaction, focused tests, and planning documents appear.
