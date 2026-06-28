# SciSiam Profile, Navigation, Lab Cards, and Score Removal Design

**Date:** 2026-06-29
**Status:** Approved design

## Goal

Make lab discovery the primary SciSiam experience, consolidate personal learning information inside Profile, remove every student and teacher scoring flow, simplify lab cards, and give Mathematics a genuinely light pink visual identity.

## Confirmed Product Decisions

- `/` redirects to `/labs`; the separate home dashboard is no longer part of navigation.
- Desktop and mobile navigation contain only Labs, Missions, and Profile.
- Learning History moves into Profile and is removed from navigation.
- `/history` remains only as a compatibility redirect to `/profile?tab=history`.
- Profile contains Overview, Learning History, and Rewards tabs.
- Scores, points, XP, levels, score-based achievements, and teacher grading are removed from active product behavior.
- Missions remain, but completing a mission records completion and contributes to rewards without granting points.
- Lab cards have no Details action and do not navigate when their image or title is clicked.
- Each card has a short Thai title as its primary title and the existing English title as secondary text.
- The only card action is a full-width Enter Lab button. It stays disabled for unfinished simulations.
- Mathematics uses the selected **Pastel Blush** theme.

## Information Architecture

### Routes

- `src/app/page.tsx` becomes a server redirect to `/labs`.
- `/labs` is the application entry and discovery surface.
- `/missions` remains available without point rewards.
- `/profile` owns overview, history, and rewards.
- `/history` redirects to `/profile?tab=history` so old bookmarks remain valid.
- Existing detail and simulation routes remain valid when reached by direct URL or an in-simulation back link.

### Navigation

Both `Sidebar` and `MobileTabBar` use the same three destinations:

1. ห้องแล็บ
2. ภารกิจ
3. โปรไฟล์

Removing Home, Scores and Rewards, and Learning History from navigation prevents duplicate destinations. Profile query parameters select `overview`, `history`, or `rewards` without affecting authorization.

## Profile Design

The student profile uses three explicit tabs:

- **ภาพรวม:** identity, completed labs, category progress, and recent activity without scores or levels.
- **ประวัติการเรียนรู้:** the searchable/filterable history currently rendered by `LearningHistoryPage`, embedded without a second Navbar or Sidebar.
- **รางวัล:** badges derived from completed labs, completed missions, category breadth, and learning continuity.

The history implementation should be split into reusable content and route shell only where needed. This avoids copying history loading, merging, filtering, and empty-state logic into Profile.

Rewards must not depend on `total_points`, XP, level, `last_score`, or `points_awarded`. Existing point-based reward copy is replaced by observable learning milestones such as first completed lab, multiple completed labs, multiple categories explored, and completed missions.

## Score-System Deactivation

The score schema is retained to avoid destructive data loss, but the application stops reading, displaying, or increasing it.

### Student flows

- Remove the Navbar points counter and points cache behavior.
- Remove points, XP, levels, per-run scores, and score-based copy from Profile, History, Missions, and simulation UI.
- Keep experiment progress percentages when they describe simulation state, but do not call them scores or rewards.
- Centralize score removal in the shared experiment save path: persisted new runs use `score = null` and award zero points. Existing simulation components do not each need a scoring rewrite.
- Remove local `scisiam_points` reads and writes from active learning and authentication flows.

### Mission flows

- Mission completion remains persisted.
- Claiming or completing a mission awards zero points and zero XP.
- Mission UI reports completion or reward unlocks, never a numeric award.

### Teacher flows

- Teacher Dashboard keeps student progress, experiment results, and feedback.
- Remove score inputs, grade actions, score columns, score summaries, and score spreadsheet export.
- Teacher feedback remains qualitative and does not write numeric grades.

### Supabase compatibility

Add a forward migration that replaces the current save and mission RPC behavior so it no longer increments `total_points`, XP, level, run score, or awarded points. Existing columns remain dormant for compatibility and rollback safety. Historical values are neither deleted nor surfaced.

## Lab Card Data and Interaction

`LabData` gains a required `thaiTitle` field. All 103 entries in `src/data/labs.ts` receive a concise, subject-correct Thai name. `title` remains the existing English source used by detail and simulation pages.

Card hierarchy:

1. Subject and grade badges
2. Short Thai title
3. English title in smaller secondary text
4. Short description
5. One full-width Enter Lab button

`onViewDetails` and the Details button are removed from the listing flow. The card itself is not interactive. The Enter Lab button continues to route ready labs to `/labs/[id]/simulation`; unfinished labs remain disabled with their current readiness explanation.

## Mathematics Pastel Blush Theme

Mathematics product chrome uses light pink surfaces rather than saturated rose/red:

- Primary surface: `pink-50`
- Hover/selected surface: `pink-100`
- Borders and primary button: `pink-200`
- Strong hover: `pink-300`
- Icons and secondary accents: `pink-600`
- Text on light pink: `pink-800` or `pink-900`

The Mathematics category filter, cards, detail-page chrome, shared simulation shell, and command buttons follow these tokens. Saturated `rose-600` or red gradients are not used for Mathematics UI actions. Scientific plots may retain multiple colors when those colors distinguish variables or series.

## Error Handling and Compatibility

- Invalid lab IDs keep the existing not-found behavior.
- Unfinished labs stay disabled and never fall back to an unrelated simulation.
- Old `/history` links redirect safely.
- Old point and score database fields remain readable by legacy migrations but are ignored by current UI and write paths.
- Existing user work in the dirty worktree is preserved and incorporated without reverting unrelated changes.

## Verification

Regression coverage must confirm:

- `/` redirects to `/labs`.
- Desktop and mobile navigation expose only Labs, Missions, and Profile.
- `/history` redirects to the Profile history tab.
- Profile exposes Overview, Learning History, and Rewards.
- No student or teacher UI displays points, XP, levels, run scores, or grading controls.
- Shared save and mission flows award zero points and persist no run score.
- Every lab has `thaiTitle`; cards render Thai primary and English secondary titles.
- Lab cards have no Details action or card-level navigation and retain one Enter Lab action.
- Mathematics chrome uses Pastel Blush classes and no saturated rose/red action classes.
- Existing readiness registry and save-key invariants still pass.

Run `npm test`, `npm run lint`, and `npm run build`, then inspect `/labs`, `/profile?tab=history`, `/profile?tab=rewards`, and a Mathematics simulation at desktop and mobile widths.

## Acceptance Criteria

The work is complete when users land on Labs, navigate through only three primary destinations, find history and rewards inside Profile, encounter no active scoring behavior, see concise Thai lab names on every card, and experience Mathematics as a light pink category without losing data-visualization clarity.
