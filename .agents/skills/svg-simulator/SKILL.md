---
name: svg-simulator
description: Use when Codex creates, fixes, reviews, or optimizes an interactive SVG, Canvas, physics, chemistry, biology, or mathematics simulation for SciSiam in React/Next.js. Enforces scientific validity, stable animation timing, accessible responsive visuals, SharedSimulationShell integration, experiment saving, registry alignment, and browser verification.
---

# SciSiam SVG Simulator

Build an interactive learning experiment, not a decorative calculator.

**Core contract:** scientific correctness and a reliable learning flow come before visual polish. Never invent a physical effect merely to make the stage look active.

## Workflow

1. Inspect the lab metadata, details, readiness registry, save-key registry, route selector, and the closest working simulation.
2. Define the model before the viewport: assumptions, equations, units, parameter ranges, initial conditions, and expected behavior.
3. Write at least one known-case check and one invariant or boundary check before implementing the visual behavior.
4. Select the renderer from the table below. Reuse existing SciSiam components before adding an abstraction or dependency.
5. Implement controls, stage, metrics, graph/table, mission context, and save flow as one coherent experiment.
6. Verify both `/labs/[id]` and `/labs/[id]/simulation` on mobile and desktop.

## Renderer Selection

| Need | Renderer |
|---|---|
| A few hundred inspectable vector elements, labels, handles, or paths | SVG |
| Hundreds or thousands of particles, pixels, or frequent full-scene painting | Canvas |
| Genuine spatial depth, camera, lighting, or 3D interaction | Three.js |
| Controls, forms, tables, and text | Semantic HTML |

Do not force SVG when Canvas is materially faster. Keep controls outside the drawing surface.

## Scientific Validity

- Use SI units internally unless the domain requires another standard. Convert only at input/output boundaries.
- Clamp inputs to physically and pedagogically meaningful ranges. Handle zero, negative, extreme, and singular values explicitly.
- State simplifications in the theory or tips panel. Do not display more precision than the model supports.
- Use seeded randomness when an experiment must be reproducible or saved.
- Tie flames, phase changes, bubbles, color changes, or biological events to an explicit modeled state. Never infer a flame from an arbitrary temperature threshold.
- Validate uncertain equations against a primary source. Check known-case results, monotonic relationships, and conservation laws within a stated tolerance.

## Stable Time Integration

Use a fixed timestep for physics. Prefer semi-implicit Euler for simple systems and Verlet or a proven domain library when stability requires it. Clamp elapsed wall time so returning from a background tab cannot launch the model forward.

```tsx
const STEP = 1 / 120;

useEffect(() => {
  let frameId = 0;
  let previous = performance.now();
  let accumulator = 0;

  const frame = (now: number) => {
    const elapsed = Math.min((now - previous) / 1000, 0.05);
    previous = now;

    if (!document.hidden && runningRef.current) {
      accumulator += elapsed;
      while (accumulator >= STEP) {
        simulateStep(STEP, simulationRef.current);
        accumulator -= STEP;
      }
      paintFrame(simulationRef.current);
    }

    frameId = requestAnimationFrame(frame);
  };

  frameId = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(frameId);
}, []);
```

Update SVG attributes through element refs or paint Canvas directly for smooth motion. Publish React state for visible metrics at roughly 10-20 Hz. Bound every history array, reset model timing with the experiment, and use `useMemo` only for genuinely expensive derived paths, points, or rows.

## Visual And Interaction Contract

- Make the experiment stage the primary focus. Match the lab card/detail illustration and the real apparatus or mathematical object.
- Use gradients, textures, filters, and shadows only when they clarify material, depth, or state. Avoid large blur filters and decorative motion.
- Generate unique SVG definition IDs with `useId` when multiple instances can render together.
- Give informative SVGs `<title>` and `<desc>` through `aria-labelledby`; hide purely decorative SVGs from assistive technology.
- Provide keyboard-operable controls, visible focus, labels for icon buttons, 44px touch targets, and non-color status cues.
- Respect `prefers-reduced-motion` for decorative effects. Preserve essential experiment behavior and always provide pause/reset controls.
- Use a stable `viewBox`, responsive constraints, and an explicit aspect ratio. Prevent labels, controls, and metrics from covering the experiment at 390px.

## SciSiam Integration

- Reuse `SharedSimulationShell` instead of rebuilding the page chrome.
- Save through `saveExperimentAndSync`; never create an isolated local-only authoritative progress flow.
- Keep `labsData`, `labDetails`, `labSimulationRegistry.ts`, and `labSavedExperiments.ts` aligned. Register a lab as ready only after its real simulation and save flow work.
- Route unsupported labs to the matching placeholder. Never fall back to Newton cooling or another unrelated simulation.
- Include start/pause when time evolves, reset, log/save, clear disabled/loading states, live values, and a graph or table for measurable output.

## Verification Gate

Before completion:

- Run known-case, boundary, and invariant tests for the model.
- Run `npm test`, `npm run lint`, and `npm run build` as appropriate.
- Inspect the changed detail and simulation routes at 390px, tablet, and desktop/fullscreen.
- Check console errors, hydration warnings, overflow, nonblank stage pixels, control overlap, and save behavior.
- Confirm timers, animation frames, observers, and listeners are cleaned up.

## Reject These Failure Modes

- Correct fabricated science before polishing visuals.
- Replace frame-rate-dependent motion with fixed timestep integration.
- Move per-frame React state into refs and throttle rendered metrics.
- Add text, shape, icon, or pattern when color or motion is the only status signal.
- Keep a lab incomplete until its simulation and save integration work.
