---
name: frontend-design
description: Design and refine SciSiam UI/UX for clean lab dashboards, responsive educational screens, Thai typography, and polished interactions. Use before major visual changes.
---
# Frontend Design - SciSiam UI/UX

Use this skill when redesigning pages, lab cards, detail pages, simulation screens, navigation, profile, or AI Tutor UI.

## Design Direction

- SciSiam should feel like a clean educational lab dashboard, not a marketing landing page or decorative sci-fi mockup.
- Prefer restrained glass, white space, clear hierarchy, and subject color accents.
- Avoid heavy glow, noisy gradients, nested cards, decorative blobs, and one-note blue/purple layouts.
- Read `DESIGN.md` and `AGENTS.md` when changing global design rules.

## Workflow

1. Identify the page goal and primary user action.
2. Reduce clutter before adding decoration.
3. Make the main science task visually dominant: experiment area, controls, graph/table, theory, progress.
4. Keep controls predictable: icon buttons for tools, segmented controls for modes, sliders/inputs for numeric variables, tabs/filters for categories.
5. Verify mobile first at about 390px width, then tablet and desktop.

## SciSiam Rules

- Home page: search, category filters, and lab cards must be easy to scan.
- Detail page: title, objective, equipment, theory, and steps must be clear without overwhelming the user.
- Simulation page: experiment viewport and controls should be visible early; sidebars must not compete with the main experiment.
- Floating AI Tutor must not cover primary actions, especially on mobile.
- Thai text needs `leading-relaxed` or `leading-[1.6]`, no `tracking-tight`, and overflow protection.

## Validation

- Check browser console for errors and hydration warnings.
- Check text overflow, button label fit, hover/focus states, and mobile layout.
- For visual changes, capture or inspect the affected page in browser before reporting completion.
