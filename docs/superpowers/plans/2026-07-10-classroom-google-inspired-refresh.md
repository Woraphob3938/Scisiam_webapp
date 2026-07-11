# Classroom Google-Inspired Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make SciSiam classrooms easier to scan and act on by adding a subject-aware room identity, an overview tab, and compact assignment cards without changing classroom authorization or storage.

**Architecture:** Keep the current Supabase classroom, assignment, submission, and notification data contracts. Derive the room theme and overview from existing lab IDs and assignment data in client UI code. Keep the shared `Kanit` wordmark while using `Prompt` for normal Thai UI text.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, Radix Tabs and Dialog, lucide-react, existing Node regression tests.

## Global Constraints

- Do not add a migration, new table, or persistent announcement model in this phase.
- Preserve owner-only classroom actions and current assignment/file submission flows.
- Keep 390px layouts usable; a four-tab strip may scroll horizontally rather than compress labels.
- Use native and Radix accessibility semantics; retain visible focus states.

---

### Task 1: Define visual and typography regression expectations

**Files:**
- Modify: `tests/classroom-workspace-ui.test.mjs`
- Modify: `tests/typography.test.mjs`

- [ ] Add failing assertions for the overview tab, subject-aware classroom identity, compact assignment status, and the Prompt/Kanit font split.
- [ ] Run `node --test tests/classroom-workspace-ui.test.mjs tests/typography.test.mjs` and confirm the missing UI markers fail.

### Task 2: Add the shared classroom presentation model

**Files:**
- Create: `src/lib/classroom-presentation.ts`
- Test: `tests/classroom-workspace-ui.test.mjs`

- [ ] Add `getClassroomPresentation(labIds)` that returns one stable subject theme from the first known lab category and a safe science-neutral fallback.
- [ ] Return only presentation tokens and Thai labels; it must not change classroom data or authorization.
- [ ] Re-run the targeted tests and confirm the presentation contract passes.

### Task 3: Refresh the classroom list

**Files:**
- Modify: `src/app/classrooms/page.tsx`
- Test: `tests/classroom-workspace-ui.test.mjs`

- [ ] Change each classroom card to a course-cover header with grade, room name, teacher name, and a single room-entry action.
- [ ] Use the shared presentation model and retain the real lab/member counts.
- [ ] Re-run `node --test tests/classroom-workspace-ui.test.mjs`.

### Task 4: Refresh the classroom workspace

**Files:**
- Modify: `src/app/classrooms/[id]/page.tsx`
- Test: `tests/classroom-workspace-ui.test.mjs`

- [ ] Replace the plain overview header with a subject-aware course cover and move owner controls beneath it.
- [ ] Add `ภาพรวม` before `งาน`, `แล็บ`, and `สมาชิก`; derive its activity and due-work summaries from existing assignments, submissions, and notifications.
- [ ] Compact assignment rows so details and the existing submission form expand only when the user requests them.
- [ ] Preserve all current buttons, labels, file controls, focus styles, and owner/member permissions.
- [ ] Re-run the targeted regression suite.

### Task 5: Apply the approved type system and verify

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Test: `tests/typography.test.mjs`

- [ ] Load `Prompt` for UI text and retain `Kanit` only for `.scisiam-wordmark`.
- [ ] Run `npm test`, `npm run lint`, `npm run build`, and inspect the classroom list and workspace at desktop and mobile widths.
