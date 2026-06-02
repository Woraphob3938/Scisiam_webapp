---
name: SciSiam Virtual Lab
description: Clean Thai science lab dashboard for competition-ready virtual experiments and future public web, PC, and mobile use.
colors:
  app-background: "#f8fafc"
  app-background-muted: "#f1f5f9"
  surface: "#ffffff"
  soft-surface: "#f8fafc"
  border: "#e2e8f0"
  border-muted: "#edf2f7"
  heading: "#0f172a"
  body: "#475569"
  muted: "#94a3b8"
  primary-blue: "#2563eb"
  primary-blue-hover: "#1d4ed8"
  indigo-accent: "#4f46e5"
  physics: "#2563eb"
  physics-soft: "#38bdf8"
  chemistry: "#9333ea"
  chemistry-soft: "#a855f7"
  biology: "#22c55e"
  biology-soft: "#84cc16"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "Prompt, Inter, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Prompt, Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Prompt, Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
  body:
    fontFamily: "Prompt, Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Prompt, Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  dialog: "32px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  page-mobile: "16px"
  page-tablet: "24px"
  page-desktop: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-blue-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.label}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary-blue}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    typography: "{typography.label}"
  input-search:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    typography: "{typography.label}"
  lab-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.heading}"
    rounded: "{rounded.xl}"
    padding: "20px"
  subject-chip:
    backgroundColor: "{colors.soft-surface}"
    textColor: "{colors.primary-blue}"
    rounded: "{rounded.lg}"
    padding: "6px 12px"
    typography: "{typography.label}"
---

# Design System: SciSiam Virtual Lab

## 1. Overview

**Creative North Star: "The Calm Science Bench"**

SciSiam is a clean Thai science learning dashboard, not a decorative landing page and not a loud game interface. The product should feel like a modern lab bench: organized, bright, trustworthy, and ready for repeated use by students and teachers. It is polished enough for competition judging, but restrained enough to become a real public web, PC, and mobile app.

The interface must make the next learning action obvious within the first five seconds. Search, category filters, lab cards, experiment controls, formulas, graphs, tables, progress, and AI Tutor all exist to serve the learning flow. Decoration is only acceptable when it clarifies the science or helps orient the student.

SciSiam explicitly rejects the PRODUCT.md anti-references: a loud game UI with saturated colors everywhere, a generic gradient landing page, decorative dashboards packed with cards that do not support learning, childish visuals, unclear sci-fi decoration, fake system-status badges, and any layout that makes users hunt for the next useful action.

**Key Characteristics:**

- Clean white surfaces, soft borders, and restrained science accents.
- Thai-first readability with Prompt as the main UI typeface.
- Apparatus-specific visuals for each lab, never generic atmosphere.
- Product density that supports scanning instead of exhausting the student.
- Honest readiness states for incomplete labs and incomplete production data.

## 2. Colors

The palette is a restrained white-and-slate lab surface with one primary blue action color and subject accents for Physics, Chemistry, and Biology.

### Primary

- **SciSiam Action Blue** (`#2563eb`): Primary actions, active home navigation, selected filters, AI Tutor button, and the most important interactive states.
- **Deep Action Blue** (`#1d4ed8`): Hover and pressed states for primary blue controls.
- **Focused Indigo** (`#4f46e5`): Secondary emphasis, active progress, and science UI states that need a slightly more technical tone than primary blue.

### Secondary

- **Physics Blue** (`#2563eb`) and **Physics Sky** (`#38bdf8`): Physics identity, graph lines, cooling/circuit emphasis, and small lab badges.
- **Chemistry Purple** (`#9333ea`) and **Chemistry Violet** (`#a855f7`): Chemistry identity, titration/gas-law apparatus, and selected Chemistry filters.
- **Biology Green** (`#22c55e`) and **Biology Lime** (`#84cc16`): Biology identity, plant/genetics/cell-cycle accents, and success-adjacent biology indicators.

### Tertiary

- **Success Green** (`#10b981`): Completed actions, readiness, progress success, and valid states.
- **Warning Amber** (`#f59e0b`): Caution, setup hints, points, and non-blocking warnings.
- **Danger Red** (`#ef4444`): Error, unsafe/invalid input, or critical status only.

### Neutral

- **Lab Canvas** (`#f8fafc`): Main app background.
- **Muted Lab Canvas** (`#f1f5f9`): Secondary page bands, input fills, and quiet panels.
- **White Surface** (`#ffffff`): Cards, navbar, dialogs, search, control panels, and simulation side panels.
- **Soft Border** (`#e2e8f0`): Standard boundaries and navigation separators.
- **Muted Border** (`#edf2f7`): Low-emphasis dividers inside cards.
- **Ink Heading** (`#0f172a`): Page titles, card titles, and high-priority labels.
- **Slate Body** (`#475569`): Descriptions, helper text, and readable Thai paragraphs.
- **Muted Slate** (`#94a3b8`): Secondary metadata only; never use for important instructions.

### Named Rules

**The Accent Rarity Rule.** Subject colors are accents, not page themes. A Physics page must not become entirely blue, and a Chemistry section must not flood the screen with purple.

**The Honest State Rule.** Green means ready or successful, amber means preparation or caution, and red means error or danger. Never use semantic colors as decoration.

## 3. Typography

**Display Font:** Prompt with Inter fallback.<br>
**Body Font:** Prompt with Inter fallback.<br>
**Label/Mono Font:** Inter or browser monospace only for numbers, formulas, and table-like data when needed.

**Character:** The type system is friendly, clear, and Thai-first. It should read like a student-facing science dashboard, not a marketing poster. Hierarchy comes from weight, size, and spacing; never from cramped Thai letter spacing.

### Hierarchy

- **Display** (`800`, `1.875rem` mobile to about `3rem` desktop, `1.25` line-height): Page titles such as the lab list and major detail-page titles. Keep letter spacing normal.
- **Headline** (`800`, `1.5rem`, `1.3` line-height): Section headers, simulation titles, and important panels.
- **Title** (`700`, `1.125rem`, `1.45` line-height): Lab card names, sidebar card headings, and compact section titles.
- **Body** (`400-600`, `1rem`, `1.6` line-height): Thai descriptions, theory explanations, and guidance text. Keep prose around 65-75 characters when possible.
- **Label** (`700`, `0.875rem`, `1.45` line-height): Buttons, tabs, chips, metrics, and compact UI labels. Labels may be smaller, but not pale if they carry important meaning.

### Named Rules

**The Thai Breath Rule.** Thai text must use comfortable line height (`1.45-1.6`) and normal letter spacing. Negative tracking on Thai text is forbidden.

**The Dashboard Scale Rule.** Product UI uses fixed, predictable type sizes. Do not use oversized hero typography inside dashboards, sidebars, cards, or control panels.

## 4. Elevation

SciSiam uses a hybrid of tonal layering, thin borders, and soft shadows. Surfaces are usually flat at rest, with depth reserved for navbar separation, lab cards, floating AI, dialogs, dropdowns, and hover feedback. Heavy shadows are forbidden because they make the app feel like a marketing mockup instead of a dependable learning tool.

### Shadow Vocabulary

- **Surface Rest** (`box-shadow: 0 1px 2px rgba(15,23,42,0.04)`): Quiet cards and empty states.
- **Interactive Lift** (`box-shadow: 0 8px 20px rgba(37,99,235,0.10)`): Active filters, primary buttons, and subject controls.
- **Floating Panel** (`box-shadow: 0 20px 50px rgba(148,163,184,0.35)`): AI Tutor panel, dropdown search results, and dialogs.
- **Soft Subject Glow** (`box-shadow: 0 10px 30px -10px rgba(59,130,246,0.20)`): Rare subject accents where a lab visual needs focus.

### Named Rules

**The Flat-By-Default Rule.** A panel earns elevation only when it floats, opens, hovers, or must stand above nearby content.

**The No Decorative Glow Rule.** Glows must clarify subject, state, or interaction. Do not add blur fields just to fill empty space.

## 5. Components

### Buttons

- **Shape:** Soft rectangular controls (`12px` radius) for routine buttons; circular controls only for icon-only actions.
- **Primary:** Solid SciSiam Action Blue (`#2563eb`) or subject-aware accent on lab-specific simulation actions; white text; bold label; `10-14px` vertical padding depending on density.
- **Hover / Focus:** Hover darkens to Deep Action Blue (`#1d4ed8`) and may lift subtly. Focus must use a visible blue ring; never remove focus without replacement.
- **Secondary / Ghost:** White surface, soft border, slate or primary-blue text. Use for `รายละเอียด`, back links, reset, and non-primary actions.
- **Disabled / Loading:** Disabled buttons use muted slate/gray and must clearly stop pointer interaction. Loading buttons show inline spinner or state text.

### Chips

- **Style:** Subject chips use pale tinted backgrounds, soft borders, and strong readable labels.
- **State:** Selected category filters use solid subject/action color and white text. Unselected filters stay white with slate labels.
- **Rule:** Do not show status pills that do not help users choose a lab. Readiness labels are useful only when they explain whether the lab can be entered.

### Cards / Containers

- **Corner Style:** Lab cards and major panels use generous but controlled corners (`16-24px`). Dialogs may use `32px`; routine cards should not.
- **Background:** White Surface (`#ffffff`) on Lab Canvas (`#f8fafc`), with tinted subject illustration zones only when they clarify the lab.
- **Shadow Strategy:** Resting cards use soft borders and low shadow. Hover may lift slightly, but should not become glossy.
- **Border:** One-pixel soft borders are the default. Heavy borders and nested cards are prohibited.
- **Internal Padding:** Compact cards use `16-20px`; major panels use `24-32px`.

### Inputs / Fields

- **Style:** Search and form fields use White Surface or Muted Lab Canvas fills, `12-16px` radius, slate text, and clear placeholder contrast.
- **Focus:** Border shifts to SciSiam Action Blue and may add a pale blue ring. Focus must be visible for keyboard users.
- **Error / Disabled:** Error fields use Danger Red border/text with concise recovery copy. Disabled fields use muted backgrounds and labels.

### Navigation

- **Navbar:** Sticky, white, lightly blurred, with a subtle bottom border. It should remain calm and not compete with the page.
- **Sidebar:** Functional app navigation, not a decorative rail. On desktop it can expand/collapse; on mobile it should not block the main flow.
- **Active State:** Active nav item uses pale blue background and blue icon/text. Inactive items use slate text and quiet hover states.
- **Mobile Treatment:** Hide or collapse side navigation and prioritize search, category filters, lab cards, and primary actions.

### Signature Component: Lab Card

Lab cards are the main discovery object. Each card must show the lab visual, subject, honest readiness, title, short description, `รายละเอียด`, and `เข้าห้อง` or a clear disabled equivalent. The illustration must match the lab title: thermometer for cooling, circuit for Ohm, spring for Hooke, burette for titration, chamber/plant for photosynthesis, and so on.

### Signature Component: Simulation Shell

The simulation shell must put the experiment viewport and controls before long explanation. A complete lab simulation should include objective, apparatus/viewport, controls, live values, graph/table, theory/formula, steps/progress, reset/start/pause, and save/log data. On mobile, side panels stack below the experiment instead of creating horizontal scroll.

### Signature Component: AI Tutor

AI Tutor is a helper overlay, not a page takeover. The floating button must not cover `เข้าห้อง`, `เริ่มทดลอง`, or `บันทึกผล` on mobile. The panel should show current lab context when available and include a clear note that AI can be wrong.

## 6. Do's and Don'ts

### Do:

- **Do** make search, category filters, and lab cards visible early on the home page.
- **Do** make the experiment viewport and controls the strongest elements on simulation pages.
- **Do** use clean white surfaces, soft slate borders, and subject colors only as accents.
- **Do** keep Thai text breathable with `leading-relaxed` or `leading-[1.6]`.
- **Do** show units on numeric controls, graph axes, tables, and formulas.
- **Do** use real science apparatus visuals that match each lab title.
- **Do** keep unsupported labs honest: disable entry or show a matching placeholder instead of routing to a wrong simulation.
- **Do** test 390px mobile, tablet, and desktop before calling UI work finished.

### Don't:

- **Don't** build a loud game UI with saturated colors everywhere.
- **Don't** build a generic gradient landing page when the user needs a usable lab dashboard.
- **Don't** pack the interface with decorative cards that do not support learning.
- **Don't** use childish visuals, unclear sci-fi decoration, or fake system-status badges.
- **Don't** create any layout that makes users hunt for the next useful action.
- **Don't** let AI Tutor hide important mobile actions.
- **Don't** ship mock profile metrics as if they are production truth.
- **Don't** use tiny pale Thai text for important instructions.
- **Don't** use multiple saturated subject colors in the same small panel.
- **Don't** add decorative glows, blurred blobs, or looping motion unless they clarify science or state.
