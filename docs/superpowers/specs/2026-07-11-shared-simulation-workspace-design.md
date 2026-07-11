# Shared Simulation Workspace Design

## Goal

Make every SciSiam simulation feel like the Newton's Law of Cooling workspace while preserving the scientific apparatus, controls, and learning purpose of each lab.

## Product Decision

SciSiam uses one adaptable simulation workspace, not one identical control panel.

- Every ready simulation uses the same compact title area, primary experiment stage, optional real-time metrics in the upper right, lower-right fullscreen button, and controls contained inside the stage while fullscreen.
- Simulations with concise primary controls use the persistent lower control dock introduced by Newton's Law of Cooling.
- Simulations with long, multi-step, or specialised controls retain an internal expandable panel in the same location. The panel never extends below the stage or outside fullscreen.
- Foundation exploration labs retain their learning-only capability set. They do not gain fake real-time values, save actions, graphs, missions, timers, or start controls.

## Common Workspace Contract

The shared `SharedSimulationShell` owns the common layout:

1. A compact title card in the upper left containing return action, category, readiness, and lab name.
2. A single experiment boundary with the scientific scene as the visual focus.
3. Real-time metrics only when the experiment produces meaningful live values.
4. A labelled fullscreen button at the lower right, positioned above the control area.
5. A lower control area that remains in the stage and fullscreen workspace.
6. An internal advanced-control panel with a visible close button.

The shell must not add nested decorative frames around a laboratory SVG, canvas, graph, or mathematical plane.

## Control Modes

| Mode | When used | User experience |
| --- | --- | --- |
| Persistent dock | The lab supplies compact primary controls | Inputs, sliders, start/pause, reset, and save actions remain visible near the lower edge. |
| Internal panel | The lab needs long or specialised controls | A single labelled button opens controls inside the stage; the learner can close it without leaving fullscreen. |
| Exploration | Foundation reference or discovery labs | Only controls that support exploration appear; the workspace omits fake experiment chrome. |

## Migration Strategy

1. Harden the shared shell contract and regression tests so existing shared-engine labs inherit the common header, metrics, fullscreen, and panel behavior.
2. Promote labs that already provide `compactControls` to the persistent dock after checking desktop, 390px, and fullscreen layouts.
3. Add compact controls only to families where their primary inputs fit safely in the dock. Keep long workflows in the internal panel.
4. Review direct and shared engines by family: Physics/Chemistry, Biology, Mathematics, then Foundation exploration.
5. Verify every ready lab route still uses its own correct simulation and save behavior.

## Accessibility And Responsive Requirements

- All actions remain native buttons or labelled inputs and retain visible focus styles.
- Tab order follows visual order: return action, fullscreen, controls, then supporting content.
- Fullscreen and advanced-control close actions remain reachable by keyboard.
- The 390px layout may scroll within panels but must not create horizontal page overflow or cover the only close action.
- Informative SVGs keep titles and descriptions; decorative SVG marks remain hidden from assistive technology.

## Verification

- Regression tests cover the shared workspace contract, foundation exclusions, fullscreen placement, and panel containment.
- Each migration family receives desktop, 390px, and fullscreen browser checks.
- Test keyboard navigation for fullscreen and control-panel toggles.
- Run `npm test`, `npm run lint`, and `npm run build` after each migration batch.

## Out Of Scope

- Rewriting scientific models, equations, variables, or saved experiment data.
- Adding a universal timer, mission, graph, save button, or real-time metric to every lab.
- Replacing subject-specific apparatus visuals with a generic SVG.
