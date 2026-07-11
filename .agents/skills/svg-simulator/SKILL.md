---
name: svg-simulator
description: Use when creating, fixing, reviewing, or optimizing an interactive SciSiam science or mathematics simulation rendered with SVG, Canvas, or Three.js in React/Next.js.
---

# SciSiam Simulator

Build a clear learning experiment, not a decorative calculator. Scientific correctness, readable interaction, and one coherent workspace come before visual effects.

## Workflow

1. Inspect the lab metadata, details, readiness and save registries, route selector, `SharedSimulationShell`, and the closest working simulation.
2. Define assumptions, equations, units, ranges, initial conditions, expected behavior, and invalid states before designing the viewport.
3. Add a known-case test and an invariant or boundary test before implementation.
4. Choose the simplest renderer and model that fit the experiment.
5. Add only the capabilities the learning task needs.
6. Verify the detail and simulation routes on mobile, desktop, and fullscreen.

## Renderer And Model Selection

| Need | Use |
|---|---|
| Inspectable vectors, labels, handles, or paths | SVG |
| Many particles, pixels, or frequent full-scene painting | Canvas |
| Genuine depth, camera, lighting, or 3D interaction | Three.js |
| Controls, forms, tables, and explanatory text | Semantic HTML |

Prefer an analytic or closed-form model when one exists. Use fixed-timestep integration only for systems whose state genuinely evolves step by step. Clamp elapsed time, bound history, clean up animation resources, and publish React state only as often as the UI needs it.

## Scientific Contract

- Use SI units internally unless the domain requires another standard; convert at input and output boundaries.
- Handle zero, negative, extreme, and singular values explicitly.
- State model simplifications and do not display unsupported precision.
- Tie flames, bubbles, phase changes, color changes, or biological events to modeled state. Never invent activity for decoration.
- Validate uncertain equations against primary sources and test known cases, monotonic relationships, or conservation laws.

## Simulation Layout Contract

- Reuse `SharedSimulationShell`; do not rebuild page chrome inside an individual lab.
- The simulation workspace has one visual boundary. The scene must not add another card, border, padded frame, or decorative shell unless that boundary represents a real chamber or apparatus.
- Keep controls outside the SVG drawing surface but inside the same simulation stage and fullscreen container.
- Primary controls and start, pause, reset, or log actions remain visible without scrolling whenever space permits.
- Advanced controls open as an internal drawer or panel inside the stage. They must not increase page height, appear below the fullscreen container, or require leaving fullscreen.
- In fullscreen, the scene, metrics, primary controls, advanced controls, and close action remain available in the same workspace.
- At 390px, panels may scroll internally; they must not force horizontal page scrolling or cover the only way to close them.

## Annotation Contract

- Default to no arrows, leader lines, callouts, or motion trails.
- Add an arrow only when direction is a learning objective and its meaning is unambiguous from a nearby label or legend.
- Do not use the same arrow style for airflow, force, heat, and movement in one scene.
- Place measured coefficients and live values beside the apparatus they describe when space allows; for example, show `k` near the cooling apparatus rather than in a remote corner.
- Avoid duplicating the same metric in the SVG, metric card, compact controls, and advanced panel.
- Use text, shape, or icon in addition to color. Decorative marks stay hidden from assistive technology.

## Capability-Based UI

Add features because the experiment needs them, not because every simulation has them:

| Capability | Include when |
|---|---|
| Start/pause | Time evolves continuously |
| Graph or table | The learner produces measurable sequential data |
| Save/log | The run creates meaningful work or progress to revisit |
| Mission/checkpoint | It supports a stated learning objective |
| Advanced controls | Secondary variables would otherwise overload the primary dock |

Foundation reference labs may be exploration-only and should not receive fake real-time metrics, save buttons, or graphs.

## Visual And Accessibility Contract

- Match the real apparatus or mathematical object and keep the stage as the visual focus.
- Use gradients, textures, filters, and shadows only to clarify material, depth, or state.
- Generate SVG definition IDs with `useId`; informative SVGs use `<title>` and `<desc>` via `aria-labelledby`.
- Use semantic keyboard-operable controls, visible focus, labels for icon buttons, and at least 44px touch targets.
- Respect `prefers-reduced-motion`; essential experiment behavior still needs pause and reset when applicable.
- Use a stable `viewBox`, explicit aspect ratio, and responsive constraints.

## SciSiam Integration

- Save meaningful authenticated runs through `saveExperimentAndSync`.
- Keep `labsData`, `labDetails`, `labSimulationRegistry.ts`, and `labSavedExperiments.ts` aligned when registration changes.
- Unsupported labs use their matching placeholder and never fall back to another simulation.

## Verification Gate

- Run model known-case, boundary, and invariant tests.
- Run the relevant regression test, then `npm test`, `npm run lint`, and `npm run build` as appropriate.
- Inspect 390px, desktop, and fullscreen states, including advanced controls.
- Check keyboard focus, close behavior, overflow, control overlap, console errors, save behavior, and cleanup of timers or listeners.

## Reject These Failure Modes

- Fabricated science or decoration presented as measured behavior.
- Nested frames that shrink the experiment without adding meaning.
- Advanced controls rendered outside the fullscreen workspace.
- Ambiguous arrows or repeated metrics that increase cognitive load.
- Universal graph, save, mission, or animation requirements that do not fit the lab.
