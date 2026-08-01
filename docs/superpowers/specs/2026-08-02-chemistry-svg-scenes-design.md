# Chemistry SVG Experiment Scenes

## Scope

Rebuild only the main SVG experiment scenes for these shared chemistry simulations:

- `galvanic-cell`
- `chemical-kinetics`
- `solubility-product`

Keep the surrounding controls, metrics, result graph, result table, theory, save flow, and shared simulation shell unchanged.

## Interaction

The shared simulation owns a replay token. Pressing the run button changes that token so the active scene visibly performs the experiment again, including on repeated presses. Reset returns each scene to its idle state.

Use lightweight SVG and CSS animation. Respect reduced-motion preferences by showing a clear final state without continuous movement.

## Scenes

### Galvanic Cells & Voltage

Show two half-cells, metal electrodes, a salt bridge, and an external wire. Before the run, the apparatus is ready but still. During the run, electrons travel through the wire from anode to cathode, ions move through the salt bridge, the anode surface diminishes slightly, and material gathers at the cathode.

### Chemical Reaction Rates

Show a single transparent reaction vessel with two visually distinct reactant particles. During the run, particles move toward one another, collide with a brief reaction flash, and separate as visibly bonded product particles. Do not show an energy profile or chart in the scene.

### Solubility Product Constant

Show a dropper above a beaker containing dissolved ions. During the run, drops enter the solution, ions move together, and solid precipitate forms and settles at the bottom. The final state must clearly distinguish dissolved ions from precipitate.

## Visual Rules

- No numerical values, axes, plots, equations, or numeric meters inside these SVG scenes.
- Use short Thai labels only when they directly clarify apparatus or direction.
- Keep the apparatus large, uncluttered, and legible around 390 px viewport width.
- Preserve the established cyan, violet, and orange chemistry palette and accessible SVG labels.
- Avoid timers or animation loops that require React state updates.

## Verification

- Add regression coverage that checks the three dedicated scenes, the run/replay state, and the absence of the removed in-scene graph/value content.
- Run the focused regression test, lint the changed files through the project lint command, run the project test suite, and build if time permits.
- Run `graphify update .` after code changes.
