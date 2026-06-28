# Mathematics Theme And Navigation Buttons

## Goal

Make Mathematics consistently use a soft pink visual theme across discovery, detail, and simulation surfaces. Improve the visibility of the two navigation actions without competing with each page's primary experiment action.

## Scope

- Mathematics category filter and lab cards
- Mathematics lab detail hero and detail tabs
- Every Mathematics simulation that uses the shared simulation shell
- The "กลับไปหน้ารายชื่อห้องแล็บ" action on all lab detail pages
- The "รายละเอียดแล็บ" action on all simulation pages using the shared shell

## Visual Design

- Use the existing Tailwind rose palette: `rose-50` and `rose-100` for soft surfaces and borders, `rose-600` and `rose-700` for icons, labels, focus rings, and strong actions.
- Prefer solid or softly tinted surfaces over gradients so Mathematics reads as light pink rather than red.
- Keep text contrast at a readable level by using slate for body copy and rose only for emphasis.
- Preserve the existing visual identities of Physics, Chemistry, Biology, and Foundation.

## Shared Implementation

- Update the existing Mathematics entries in category and card theme maps.
- Update the Mathematics branch in the shared lab hero and detail theme maps.
- In `SharedSimulationShell`, resolve Mathematics to the existing `rose` accent regardless of a lab's individual accent prop. This prevents per-lab duplication.
- Restyle the two existing navigation links in `LabHero` and `SharedSimulationShell`; do not create new components.

## Interaction And Accessibility

- Both navigation actions remain links with their current destinations.
- Give each action a stable minimum height, visible border/background, hover state, keyboard focus ring, and arrow icon.
- Keep the start/primary simulation action visually stronger than the back/detail action.
- Verify labels fit on mobile without horizontal overflow.

## Verification

- Add regression coverage for the shared Mathematics theme and both navigation actions.
- Run focused tests first, then the full test suite, lint, production build, and the repository secret scan.
- Inspect `/labs`, one Mathematics detail page, and one Mathematics simulation at desktop and mobile widths.

## Git Scope

- Publish the current source and test work to `main`, including the recent Auth, lab catalog, simulation, and breadcrumb changes.
- Exclude generated or local-only artifacts: `graphify-out/`, `recovery_step_9.json`, `test_output.log`, and `test_output.txt`.
