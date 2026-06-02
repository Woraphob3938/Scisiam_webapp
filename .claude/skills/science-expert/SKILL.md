---
name: science-expert
description: Review, design, and implement scientifically credible SciSiam lab simulations. Use for physics, chemistry, biology formulas, units, edge cases, graphs, tables, and experiment realism.
---
# Science Expert - SciSiam Simulation Advisor

Use this skill when changing simulation math, graphs, lab variables, formulas, experiment text, or scientific explanations.

## Workflow

1. Identify the lab, subject, variables, units, and expected learning outcome.
2. Verify the governing model before coding. Prefer simple school-level models that are correct, explainable, and stable.
3. Keep calculations deterministic by default. Add experimental noise only when it improves realism and can be disabled or seeded for testing.
4. Guard math edge cases such as divide-by-zero, negative Kelvin, `Math.log10(0)`, impossible pH, empty history arrays, and invalid user input.
5. Confirm UI labels, graph axes, table headers, and saved results use the same units and variable names as the formula.

## SciSiam Models

- Newton cooling: use `dT/dt = -k(T - Ts)`. For exact per-step updates use `T_next = Ts + (T_current - Ts) * exp(-k * dt)`. If using Euler, name it explicitly as `T_next = T_current - k * (T_current - Ts) * dt`.
- Ohm's law: use `V = IR`; keep voltage, current, resistance units consistent and prevent invalid negative resistance.
- Hooke's law: use `F = kx`; keep extension in meters internally when calculating SI force.
- Acid-base titration: calculate moles and excess `[H+]` or `[OH-]`; do not approximate pH linearly near the equivalence point.
- Boyle's law: keep temperature constant and use inverse relation `P1V1 = P2V2`.
- Charles's law: calculate with Kelvin, not Celsius, using `V1/T1 = V2/T2`.
- Photosynthesis: model limiting factors for light, CO2, and temperature; avoid pretending the model is real sensor data.
- Mendelian genetics: keep genotype/phenotype ratios explainable from Punnett squares.
- Mitosis: keep phase names, order, and visual states biologically accurate.

## Code Rules

- Store continuously changing simulation internals in `useRef`; expose throttled flat state to React.
- Use real elapsed `dt` in loops so results are stable across slow and fast devices.
- Use `useMemo` for graph paths, table rows, derived metrics, and expensive SVG/canvas calculations.
- Limit history length.
- Do not add randomness inside render.
- Add comments only where the science model is not obvious.

## Validation

Before finishing, check:

- Formula output against one known hand-calculated example.
- Units in UI, graph, table, and saved result.
- Reset/start/pause/save behavior.
- `npm run lint` and `npm run build` when code changes.
