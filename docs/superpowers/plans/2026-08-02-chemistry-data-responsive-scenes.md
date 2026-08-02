# Chemistry Data-responsive Scenes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild three chemistry experiment scenes so Galvanic and Ksp use value-responsive SVG while Chemical Reaction Rates uses a value-responsive Canvas particle simulation.

**Architecture:** Add pure bounded scene-model builders beside the simulations, put the Canvas renderer in its own client component, and pass model data plus the replay token into the existing shared chemistry scene. Keep calculation output, controls, graphs, tables, save flow, and `SharedSimulationShell` unchanged.

**Tech Stack:** Next.js 16, React 19, TypeScript, SVG, Canvas 2D, CSS animations, Node test runner.

## Global Constraints

- Do not use Three.js or add dependencies.
- Do not render graphs, axes, numeric meters, or measured numeric values inside the three scenes.
- Chemical symbols such as `e⁻`, `Zn²⁺`, `Cu²⁺`, `M⁺`, and `X⁻` identify particles and are allowed.
- Use bounded deterministic visual models; extreme inputs must not create unbounded particles or animation work.
- Clean up animation frames and listeners and respect `prefers-reduced-motion`.
- Preserve unrelated dirty classroom and chemistry files.
- Do not commit or push unless the user asks.

---

### Task 1: Pure chemistry scene models

**Files:**
- Create: `src/components/labs/simulation/chemistrySceneModels.ts`
- Create: `tests/chemistry-scene-models.test.mjs`

**Interfaces:**
- Produces: `buildGalvanicSceneModel(qRatio, bridgeEfficiency)`, `buildReactionRateSceneModel(concentration, temperature)`, and `buildSolubilitySceneModel(ionConcentration, commonIon)`.
- Each function returns a frozen-shape object containing only bounded numbers and an explicit visual state.

- [ ] **Step 1: Write known-case, monotonic, and boundary tests**

```js
const lowBridge = buildGalvanicSceneModel(1, 40);
const highBridge = buildGalvanicSceneModel(1, 100);
assert.ok(highBridge.flowStrength > lowBridge.flowStrength);

const coldDilute = buildReactionRateSceneModel(0.1, 15);
const hotConcentrated = buildReactionRateSceneModel(2, 70);
assert.ok(hotConcentrated.particleCount > coldDilute.particleCount);
assert.ok(hotConcentrated.speed > coldDilute.speed);
assert.ok(hotConcentrated.productShare > coldDilute.productShare);

assert.equal(buildSolubilitySceneModel(0.2, 0).state, "unsaturated");
assert.equal(buildSolubilitySceneModel(2, 1).state, "precipitating");
assert.equal(buildSolubilitySceneModel(0.2, 0).precipitateCount, 0);
```

- [ ] **Step 2: Run the model test and verify RED**

Run: `rtk node --test tests/chemistry-scene-models.test.mjs`

Expected: FAIL because `chemistrySceneModels.ts` does not exist.

- [ ] **Step 3: Implement the three clamped builders**

Use `clamp` and normalized ranges. Bound particle counts to 12–42, Canvas speed to 24–84 px/s, product share to 0.08–0.72, SVG ion counts to 3–9, precipitate count to 0–8, and all animation-strength values to 0–1.

- [ ] **Step 4: Run the model test and verify GREEN**

Run: `rtk node --test tests/chemistry-scene-models.test.mjs`

Expected: PASS with all known cases and bounds satisfied.

### Task 2: Lock the renderer and data-flow contract

**Files:**
- Modify: `tests/chemistry-concept-scenes.test.mjs`

**Interfaces:**
- Consumes: the scene-model builders from Task 1.
- Produces: regression expectations for SVG Galvanic/Ksp, Canvas kinetics, current-variable props, replay, reduced motion, and accessible scene descriptions.

- [ ] **Step 1: Replace the canned-scene assertions with the new contract**

Assert that `ChemistryConceptSimulation.tsx` imports all model builders and `ReactionRateParticleCanvas`, passes `primary` and `secondary` into `ChemistryScene`, and renders the Canvas only for `chemical-kinetics`. Assert that the dedicated scene block contains no `ResultGraph`, axis, or formatted metric value.

- [ ] **Step 2: Run the source regression and verify RED**

Run: `rtk node --test tests/chemistry-concept-scenes.test.mjs`

Expected: FAIL because the current kinetics scene is SVG and all three scenes still depend only on `runToken`.

### Task 3: Reaction-rate Canvas renderer

**Files:**
- Create: `src/components/labs/simulation/ReactionRateParticleCanvas.tsx`
- Modify: `src/components/labs/simulation/ChemistryConceptSimulation.tsx`

**Interfaces:**
- Consumes: `ReactionRateSceneModel` and `runToken`.
- Produces: `<ReactionRateParticleCanvas model={model} runToken={runToken} />` with no React state updates per animation frame.

- [ ] **Step 1: Implement deterministic particle initialization and Canvas drawing**

Use a seeded generator based on `runToken`, a fixed maximum step, device-pixel-ratio scaling, bounded A/B particles, one reaction vessel, and bonded product pairs. Draw a clear Thai status but no measurements.

- [ ] **Step 2: Implement the animation lifecycle**

Use `requestAnimationFrame` in an effect, clamp `dt` to 32 ms, bounce at vessel boundaries, react only on A/B collisions, stop after the bounded experiment window, and cancel the frame plus resize listener on cleanup. Reduced motion draws the final state once.

- [ ] **Step 3: Route kinetics to Canvas and pass current inputs**

Change `ChemistryScene` to accept `primary` and `secondary`, build the kinetics model with `useMemo`, and replace `ReactionRateExperimentScene` with the Canvas component.

- [ ] **Step 4: Run the source regression and verify the Canvas contract is GREEN**

Run: `rtk node --test tests/chemistry-concept-scenes.test.mjs`

Expected: the Canvas/data-flow assertions pass; SVG visual assertions may remain RED until Task 4.

### Task 4: Rebuild Galvanic and Ksp SVG scenes

**Files:**
- Modify: `src/components/labs/simulation/ChemistryConceptSimulation.tsx`

**Interfaces:**
- Consumes: `GalvanicSceneModel`, `SolubilitySceneModel`, and `runToken`.
- Produces: accessible value-responsive SVG groups with chemical identity labels and bounded CSS animation.

- [ ] **Step 1: Rebuild the Galvanic apparatus**

Make the half-cells and electrodes visually dominant. Render Q-responsive Zn/Cu ions, bridge-efficiency-responsive `K⁺`/`NO₃⁻` movement, a labelled `e⁻` external direction, anode wear, and cathode deposition. Generate repeated particles from bounded model counts.

- [ ] **Step 2: Rebuild the Ksp apparatus**

Render dissolved `M⁺`/`X⁻` ions from bounded model counts, replay the drop/mixing motion, and render lattice-like precipitate only for `state === "precipitating"`. Use distinct Thai status text for unsaturated, near-saturation, and precipitating states.

- [ ] **Step 3: Connect the current models and replay token**

Build the SVG models from current `primary` and `secondary`, pass them into the scene groups, and keep `runToken` solely as the replay trigger.

- [ ] **Step 4: Run both focused test files and verify GREEN**

Run: `rtk node --test tests/chemistry-scene-models.test.mjs tests/chemistry-concept-scenes.test.mjs`

Expected: PASS.

### Task 5: Integration and visual verification

**Files:**
- Modify only if verification exposes an in-scope defect.

- [ ] **Step 1: Run focused lint and regression tests**

Run: `rtk npx eslint src/components/labs/simulation/ChemistryConceptSimulation.tsx src/components/labs/simulation/ReactionRateParticleCanvas.tsx src/components/labs/simulation/chemistrySceneModels.ts`

Run: `rtk node --test tests/chemistry-scene-models.test.mjs tests/chemistry-concept-scenes.test.mjs`

- [ ] **Step 2: Run full quality gates**

Run: `rtk npm test`

Run: `rtk npm run lint`

Run: `rtk npm run build`

- [ ] **Step 3: Browser QA all routes**

Inspect `/labs/galvanic-cell/simulation`, `/labs/chemical-kinetics/simulation`, and `/labs/solubility-product/simulation` at 390px and desktop, then fullscreen. Change both controls, replay twice, confirm visual differences, no overflow, no console errors, and no orphaned animation after route changes.

- [ ] **Step 4: Refresh the repository graph**

Run: `rtk graphify update .`

Expected: exit 0 without changing production behavior.

