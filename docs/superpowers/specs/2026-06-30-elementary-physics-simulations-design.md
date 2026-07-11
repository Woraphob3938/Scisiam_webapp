> Historical design record from 2026-06-30. It captures the decision at that time and is not the current operational specification.

# Elementary Physics Simulations Design

## Scope

Build three ready, independent elementary Physics simulations:

- `simple-circuits` - วงจรไฟฟ้าอย่างง่าย
- `floating-and-sinking` - การลอยและการจม
- `magnet-exploration` - สำรวจแม่เหล็ก

Each lab uses a short three-step mission followed by free exploration. Reuse `SharedSimulationShell`, existing lab details, and `saveExperimentAndSync`. Do not create a new simulation framework or route unsupported labs to unrelated content.

## Shared Experience

Each simulation provides:

- A responsive SVG stage as the primary surface.
- Three visible mission checkpoints with immediate evidence-based feedback.
- Free exploration after the guided concepts are demonstrated.
- Reset, log result, save experiment, clear disabled/loading states, live metrics, a compact graph or comparison view, and a result table.
- Thai-first labels, keyboard-operable controls, visible focus, 44px touch targets, non-color status cues, SVG title/description, and reduced decorative motion when requested.
- Physics-blue shell styling with a topic accent: amber for circuits, cyan for buoyancy, and red/blue for magnets.

Mission progress is derived from observed experiment states, not from arbitrary button clicks. Logging and saving remain available before mission completion.

## Simple Circuits

### Model

Use a safe ideal DC model. One cell supplies 1.5 V; two cells supply 3.0 V. The bulb uses a fixed resistance. A current flows only when the wire path is complete and the switch is closed:

`I = V / R`

Brightness is a normalized visual indicator derived from bulb power `P = VI`. It is not presented as a calibrated lumen value.

### Interaction And Missions

Learners can connect/disconnect one wire, open/close the switch, and select one or two cells.

1. Complete the path and close the switch to light the bulb.
2. Break the path or open the switch and observe zero current.
3. Compare one and two cells while the circuit is closed.

The SVG shows battery cells, insulated wires, a switch, a bulb filament, current-direction markers, and a text status for open/closed circuit. The comparison graph shows current or relative brightness by logged setup.

## Floating And Sinking

### Model

Compare object weight with maximum buoyant force in water:

`F_weight = mass * g`

`F_buoyancy = waterDensity * displacedVolume * g`

An object floats when its average density is at or below water density. The clay boat uses the same clay mass with a larger effective displaced volume; this teaches that shape affects average density and water displacement.

### Interaction And Missions

Learners choose wood, plastic, steel, or clay; predict float/sink; drop the object; and change clay between a compact ball and a hollow boat.

1. Predict and test a floating material.
2. Predict and test a sinking material.
3. Reshape clay from a sinking ball into a floating boat.

The SVG shows a transparent tank, waterline, object motion, displaced-water cue, and opposing force arrows. The comparison view plots average density against the water-density reference line.

## Magnet Exploration

### Model

Use a qualitative force-strength proxy that decreases with distance. Do not claim exact dipole-force units. Opposite poles attract, like poles repel, and only listed ferromagnetic test materials respond strongly.

### Interaction And Missions

Learners rotate the second bar magnet, adjust separation, and test iron, aluminum, wood, and plastic.

1. Place opposite poles facing and observe attraction.
2. Rotate to like poles and observe repulsion.
3. Classify which test material is attracted.

The SVG shows labeled N/S poles, field-line direction, distance, force arrows, and explicit attract/repel/no-attraction text. The comparison view records force strength or material response for each setup.

## Architecture And Integration

Create one component per lab; share only existing SciSiam shell and helpers. Add dynamic imports and entries to the direct simulation map. Mark all three ids ready, add save keys, and clear their incomplete metadata status only after the components work.

Each saved payload includes the lab id, a Thai/English title, the current setup, derived measurements, and logged trial rows. Keep in-memory trial history bounded.

The existing detail content remains the source for objectives, equipment, theory, and steps. Both detail and simulation routes must represent the same lab.

## Verification

- Add regression assertions that all three ids are ready, routed to their own components, and have save keys.
- Add known-case model checks: open circuit gives zero current; density below water floats; opposite poles attract and like poles repel.
- Run focused tests before implementation to prove the new expectations fail, then pass after implementation.
- Run the full test suite, lint, type checking/build, and secret scan.
- Browser-check each detail and simulation route at 390px, tablet, desktop, and fullscreen where available.
- Verify nonblank SVG stages, no overlap or horizontal overflow, working controls, mission progression, result logging, save behavior, and no console/hydration errors.

## Non-Goals

- No free-form wire dragging or circuit-network solver.
- No fluid CFD, wave simulation, or exact magnetic dipole solver.
- No new dependency, database schema, scoring system, or shared simulation framework.
