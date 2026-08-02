# Data-responsive chemistry experiment scenes

## Goal

Replace the canned visuals for `galvanic-cell`, `chemical-kinetics`, and `solubility-product` with experiment scenes that visibly respond to the learner's current variables and make the cause-and-effect relationship understandable without placing graphs or measured numbers inside the scene.

The surrounding `SharedSimulationShell`, controls, metrics, graph, table, theory, save flow, and classroom integration remain unchanged.

## Renderer choice

- **Galvanic Cells & Voltage:** SVG. The learning task depends on inspectable apparatus, named electrodes, ion identity, and unambiguous electron direction.
- **Chemical Reaction Rates:** Canvas. Particle count, speed, collisions, and product formation update frequently and should not publish animation state through React.
- **Solubility Product Constant:** SVG. The task depends on clearly distinguishing dissolved ions, the mixing event, and a solid precipitate state.
- **Three.js:** not used. None of the three learning goals requires camera movement, genuine depth, lighting, or 3D manipulation.

## Shared data contract

Add pure scene-model builders that clamp their inputs and expose bounded visual parameters. `calculateLab` and the scene use the same current `primary` and `secondary` inputs; the scene never parses formatted metric strings.

Known cases and invariants:

- Galvanic: greater salt-bridge efficiency produces stronger ion/electron flow; higher reaction quotient does not increase the visual electron activity. All counts and animation durations remain bounded.
- Kinetics: concentration increases particle count; temperature increases particle speed; the combined rate factor increases successful product formation. Particle count and speed remain bounded at extreme inputs.
- Ksp: low ion concentration is unsaturated with no precipitate, a value close to `Qsp/Ksp = 1` is visually near saturation, and a value above one produces a bounded solid amount. Common ion increases the saturation index.

## Scene behavior

### Galvanic cell SVG

Show a large Zn half-cell and Cu half-cell, metal electrodes, salt bridge, external wire, and a simple direction label for `e⁻`. During a run, labelled electrons move through the wire, `Zn²⁺` leaves the anode, `Cu²⁺` approaches the cathode, salt-bridge ions move in opposite directions, the Zn surface recedes, and Cu deposits on the cathode. Ion population and motion intensity reflect Q and salt-bridge efficiency. Labels use chemical identity plus color so meaning does not depend on color alone.

### Reaction-rate Canvas

Draw one reaction vessel and two reactant particle types. Concentration controls the bounded number of particles. Temperature controls speed. A fixed-timestep animation moves and bounces particles, detects opposite-type collisions, and turns a bounded share into bonded products according to the rate factor. Repeated runs reset and replay the experiment. Reduced-motion users receive the clear final state without a continuous loop.

### Ksp SVG

Show a dropper, a transparent beaker, dissolved `M⁺` and `X⁻` ions, and a solid collection zone at the bottom. During a run the drop enters, ions move, and only supersaturated conditions form a visible lattice-like precipitate. Unsaturated and near-saturated states remain dissolved but use distinct short Thai status text. Ion and precipitate counts reflect the current saturation model.

## Accessibility and responsive behavior

- SVG scenes retain `<title>`, `<desc>`, stable `viewBox`, and `aria-labelledby`.
- Canvas uses `role="img"`, a Thai `aria-label`, and fallback text.
- No graph axes, numeric meters, or measured values appear inside the three scenes.
- Chemical symbols are allowed because they identify particles rather than present measurements.
- Scene controls stay outside the renderer and remain in the shared fullscreen workspace.
- Motion cleans up `requestAnimationFrame`, respects `prefers-reduced-motion`, and does not update React state per frame.
- Verify at 390px, desktop, and fullscreen without horizontal overflow.

## Testing

- Pure model tests cover the known cases, monotonic relationships, and bounds above.
- Source regressions require SVG for Galvanic/Ksp, Canvas for kinetics, current-variable scene props, accessible descriptions, replay behavior, reduced motion, and no in-scene graphs or measured values.
- Run focused tests, the full test suite, lint, build, and browser checks for all three lab routes.

