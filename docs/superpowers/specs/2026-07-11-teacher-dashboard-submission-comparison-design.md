# Teacher Dashboard Submission Comparison Redesign

Date: 2026-07-11
Status: Awaiting user review

## Goal

Redesign the teacher dashboard around one operational question: which classroom needs follow-up based on assignment submissions? The page must use existing Supabase-backed classroom, assignment, member, and submission data. It must not introduce mock data, grading, scores, or a new database migration.

## Design Direction

The dashboard should feel like a calm teacher workspace rather than a generic analytics template. Use a comparison table as the primary surface, flat sections and dividers instead of a mosaic of equal-weight cards, and one blue accent for actions and selected state.

Remove or reduce patterns that make the current page feel generated:

- Remove the `TEACHER DASHBOARD` eyebrow.
- Replace the boxed welcome hero with a compact page header.
- Remove the four equal statistic cards.
- Remove duplicate links that both lead to `/classrooms`.
- Avoid decorative shadows, gradients, ranking cards, and unnecessary status pills.

## Information Architecture

### 1. Page Header

- Heading: `ภาพรวมการส่งงาน`
- Supporting line: teacher name and a concise explanation that the figures come from current classroom data.
- One secondary action: `จัดการชั้นเรียน`, linking to `/classrooms`.
- Display the latest refresh time as quiet metadata when data is ready.

### 2. Compact Overall Summary

Present one horizontal summary row rather than four cards:

- Total owned classrooms.
- Total students.
- Submitted work count.
- Expected submission count.
- Overall submission rate.

The overall rate is `total submissions / total expected submissions`. Expected submissions are the sum of `assignment count * student count` for each classroom. If no submissions are expected, show `0%` without presenting this as a failure.

### 3. Classroom Comparison Table

This is the main dashboard surface. Each classroom row contains:

- Classroom name and grade level.
- Student count.
- Assignment count.
- Submitted count and expected count.
- Remaining submission count.
- Submission rate with a compact progress bar and visible percentage.
- One descriptive link: `เปิดชั้นเรียน`.

Desktop uses a semantic table with column headers. Mobile uses the same data in stacked row groups without horizontal page overflow. Sorting or filtering is out of scope until teachers have enough classrooms to justify it.

### 4. Follow-up Context

A narrow secondary column on desktop, stacked below the comparison on mobile:

- `ควรติดตาม`: up to three classrooms with remaining submissions, ordered by the largest remaining count and then the lowest submission rate.
- Each item explains the reason in text, such as `ค้าง 18 รายการ · ส่งแล้ว 42%`.
- `งานส่งล่าสุด`: up to five recent submissions, showing assignment, student, classroom, and submission time.

Do not create rankings, red warning states, or labels such as “ห้องแย่ที่สุด”. A low rate is follow-up context, not a judgment about students.

## Data Model Changes

Extend the existing `TeacherClassroom` view model only. Add values already available while `TeacherDashboardSection` loads each classroom bundle:

- `submissionCount`
- `expectedSubmissionCount`
- `pendingSubmissionCount`

Reuse the existing classroom list, members, assignments, and submissions queries. Do not add a dependency, API route, database view, RPC, or migration.

## States

### Loading

Use a skeleton matching the compact summary, comparison table, and secondary column. Avoid a central spinner.

### Empty

If the teacher has no owned classrooms, explain how to create one and provide one `สร้างชั้นเรียน` action.

If classrooms exist but have no assignments, keep the comparison visible with zero expected submissions and explain that rates will appear after assigning work.

If no student has submitted work, show a calm empty state in `งานส่งล่าสุด` without hiding the classroom comparison.

### Error

Keep the current retry behavior and safe error message. Do not clear or fabricate data to make the dashboard appear populated.

## Responsive Behavior

- Desktop: comparison table occupies the main column; follow-up context uses a 300-340px side column.
- Tablet: comparison remains full width and follow-up sections move below it.
- Mobile around 390px: summary values wrap into two rows; classroom rows expose labels alongside values; actions remain at least 44px high; no horizontal page overflow.

## Accessibility

- One page `h1`, followed by logical `h2` section headings.
- Use a semantic `<table>` on desktop with a caption and scoped column headers.
- Progress bars include visible percentages and accessible labels; color is not the only indicator.
- Navigation remains links, not buttons.
- Icons paired with text are decorative and use `aria-hidden="true"`.
- Focus indicators remain visible and all touch targets meet the existing minimum size.
- Thai text keeps normal tracking and comfortable line height.

## Testing

- Update dashboard regression tests to assert the comparison table, submitted/expected/pending values, and the single classroom-management action.
- Add focused tests for aggregate and per-room submission calculations, including zero students and zero assignments.
- Run `npm test`, `npm run lint`, and `npm run build`.
- Browser-check authenticated teacher data at desktop and responsive mobile widths.

## Out of Scope

- Grading, scores, feedback workflows, attendance, announcements, calendars, and weekly trend charts.
- New Supabase tables, migrations, RPCs, or Realtime subscriptions.
- Sorting, filtering, exporting, and custom date ranges.
- Decorative charts when the comparison table already communicates the same information.
