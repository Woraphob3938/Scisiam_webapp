# SciSiam Login Entry, Account History, and Elementary Chemistry Simulations

Date: 2026-07-02
Status: Approved

## Goals

1. Opening the site root sends the learner directly to `/login`.
2. A newly registered, authenticated account does not inherit experiment history from another account on the same browser.
3. Rebuild the following elementary chemistry labs as complete open-exploration simulations:
   - States of Matter (`states-of-matter`)
   - Mixing and Separating (`mixing-and-separating`)
   - Dissolving and Solutions (`dissolving-solutions`)

The simulations must remain consistent with SciSiam's existing lab detail, readiness, save, and routing models.

## Entry Route

The root route redirects to `/login`. Direct links to authenticated product routes continue to use the existing authentication behavior; this change only defines the default site entry.

## Learning History Ownership

Supabase is authoritative for authenticated users.

- When a cloud learning snapshot is available, the history list, latest experiment, counters, and category progress use cloud experiment runs only.
- Browser `localStorage` records are used only when no cloud-backed account snapshot is available, preserving prototype and offline convenience.
- Local records are not deleted automatically. They are simply excluded from another authenticated account's history.
- Empty cloud history renders a genuine empty state and must not fall back to sample or stale device records.

This fixes cross-account history leakage without adding a new persistence layer or migration.

## Shared Simulation Experience

All three labs use the existing `SharedSimulationShell`. They are open exploration labs and do not contain a three-step mission flow.

Each lab provides:

- A prominent responsive SVG experiment stage.
- Controls outside the stage on mobile and desktop.
- Start/pause, reset, and save actions with clear disabled/loading states.
- Live measurements near the experiment.
- A bounded observation log plus a graph or table appropriate to the experiment.
- Objectives, simplified theory, steps, and a note about model limitations.
- Saving through `saveExperimentAndSync` with the existing registered save key.
- Deterministic or fixed-step updates so results do not depend on display frame rate.
- Cleanup for timers and animation frames and bounded sample arrays.
- SVG `title` and `desc`, unique definition ids, visible keyboard focus, and reduced-motion support.

## States of Matter

### Interaction

The learner changes temperature across an elementary water model, starts or pauses particle motion, and records observations.

### Model

- Below 0 C: solid, particles remain ordered and vibrate in place.
- 0 C through below 100 C: liquid, particles remain close and move past one another.
- 100 C and above: gas, particles spread out and move freely.
- Particle positions update from stable seeded initial data and a fixed time step.

### Outputs

- Current temperature, phase, particle spacing, and motion level.
- A temperature-versus-time graph with phase regions.
- An observation table containing time, temperature, and state.

The UI states that the phase boundaries are a simplified water model at normal pressure.

## Mixing and Separating

### Interaction

The learner selects a mixture and a separation method, runs the apparatus, and compares results across trials.

### Supported relationships

- Iron and sand: magnetism.
- Sand and water: filtration.
- Salt and water: evaporation.
- Gravel and sand: sieving.

### Outputs

- Animated apparatus matched to the selected method.
- Progress, recovered material, purity, and a concise result explanation.
- A trial comparison graph and table for method, recovery, and purity.

Incorrect methods still produce a scientifically meaningful partial or unsuccessful result instead of showing unrelated equipment or content.

## Dissolving and Solutions

### Interaction

The learner adjusts water temperature, solute amount, and stirring, then observes the dissolving process.

### Model

- Temperature and stirring change the dissolution rate.
- Solute amount changes the time required within the supported soluble range.
- A deterministic rate equation updates dissolved mass with a fixed time step.
- The interface distinguishes dissolution rate from maximum solubility and labels the model as simplified.

### Outputs

- Dissolved mass, remaining mass, concentration, elapsed time, and percent dissolved.
- A percent-dissolved-versus-time graph.
- A trial table containing temperature, stirring, amount, completion time, and result.

## Data and Registry Integrity

The existing ids must remain aligned across:

- `src/data/labs.ts`
- `src/data/labSimulationRegistry.ts`
- `src/data/labSavedExperiments.ts`
- `src/app/labs/[id]/simulation/page.tsx`

Unsupported labs must never fall back to one of these simulations.

## Verification

- Add regression coverage for the root redirect and authenticated-history isolation.
- Add pure model/invariant tests where practical for phase selection, separation outcomes, and dissolution-rate behavior.
- Run `npm test`, `npm run lint`, and `npm run build`.
- Inspect `/login`, `/profile?tab=history`, and all three detail and simulation routes.
- Check desktop and approximately 390 px mobile widths for overflow, covered actions, animation cleanup, console errors, and hydration warnings.

## Non-goals

- No new database tables or migrations.
- No shared elementary-chemistry engine unless implementation reveals meaningful duplication.
- No mission/checkpoint flow for these three labs.
- No deletion or migration of existing browser-local experiment records.
