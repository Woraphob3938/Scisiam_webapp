# Classroom Experiment Submission and Grading

Date: 2026-07-12
Status: Awaiting final user review

## Goal

Make classroom navigation obvious without horizontal scrolling, then connect classroom assignments to real saved experiment runs so students can submit a lab conclusion and teachers can review and grade the work from real Supabase data.

## Product Decisions

- A classroom assignment may target one selected lab.
- The teacher sets the assignment maximum score when creating the assignment.
- A student can submit only an experiment run that belongs to the student and matches the assignment lab.
- The submission conclusion is required and stored with the submission.
- A student may replace the submitted run or edit the conclusion until the teacher grades it.
- Once graded, the submission is read-only for the student.
- A teacher may grade only submissions in a classroom they own.
- The score must be between zero and the assignment maximum score.
- Existing file and link attachments remain supported for assignments that do not target a lab.

## Classroom Navigation

Replace the horizontally scrollable tab strip with a layout that always exposes all four destinations:

- Mobile: a two-column, two-row grid.
- Tablet and desktop: four equal-width items in one row.
- Destinations: `ภาพรวม`, `ห้องแล็บ`, `งานของชั้นเรียน`, and `สมาชิก`.
- The active destination uses a blue background tint, blue text, and a visible focus outline.
- The tab group must not use horizontal overflow, hidden scrollbars, or swipe-only discovery.
- Each item remains a semantic button in a labelled tab list and retains keyboard navigation.

## Teacher Assignment Flow

The existing assignment dialog gains two fields:

1. `แล็บที่มอบหมาย` selects one lab from the classroom lab catalog or `งานทั่วไป`.
2. `คะแนนเต็ม` accepts a positive integer from 1 to 100 when a lab is selected.

For a general assignment, the existing file and link flow remains unchanged and no experiment run is required. For a lab assignment, the selected lab and maximum score are shown on the assignment row.

The system does not infer a lab from a title and does not automatically choose a different classroom lab.

## Student Submission Flow

For a lab assignment, the assignment row has one primary action:

- `ส่งงาน` when no submission exists.
- `แก้ไขงาน` when an ungraded submission exists.
- `ดูงานและคะแนน` when the teacher has graded it.

Selecting the action opens an accessible modal inside the classroom page. The modal contains:

- Assignment title, lab title, due date, and maximum score.
- The student's most recent saved experiment runs for the assigned lab.
- A selected-run preview containing the existing lab illustration, saved time, variables, live values, graph summary, table rows, and experiment summary when available.
- A required `สรุปผลการทดลอง` textarea with a 20 to 1,000 character limit.
- A clear empty state linking to `/labs/<lab-id>/simulation` when the student has no eligible saved run.
- A `ส่งงาน` or `อัปเดตงาน` action with loading, success, and recoverable error states.

The preview is built from real `experiment_runs` data and existing lab artwork. No generated or fabricated experiment image is used.

The server-side submission operation verifies all of the following in one transaction:

- The caller is an active classroom member.
- The caller is the submission student.
- The assignment belongs to the classroom and targets the same lab.
- The selected experiment run belongs to the caller.
- The experiment run lab matches the assignment lab.
- The submission is not already graded.

## Teacher Review and Grading Flow

The teacher dashboard keeps the existing real-data comparison layout. Recent submissions gain a review state:

- `รอตรวจ` for an ungraded submission.
- `<score>/<max score>` for a graded submission.

Selecting a submission opens its classroom with `tab=classwork` and the submission id in the query string. The classroom page opens the review modal automatically after validating that the current user owns the classroom.

The review modal shows:

- Student, classroom, assignment, submission time, and status.
- The same experiment-run preview seen by the student.
- The student's experiment conclusion.
- The teacher's score field with the maximum score displayed beside it.
- `บันทึกคะแนน` as the primary action.

Saving a grade records the grader, score, and grading time. The dashboard refreshes from Supabase data and the submission moves from `รอตรวจ` to its score. Editing feedback, rubrics, rankings, GPA, points, and rewards are outside this version.

## Data Model

Create one forward Supabase migration. Do not edit applied migrations.

### `classroom_assignments`

- `lab_id text null` with a composite foreign key from `(classroom_id, lab_id)` to `public.classroom_labs(classroom_id, lab_id)`, ensuring the assigned lab belongs to that classroom.
- `max_score smallint null` with a check requiring `max_score between 1 and 100`.
- A consistency check requires both fields together for a lab assignment and permits both to be null for a general assignment.

### `classroom_assignment_submissions`

- `experiment_run_id uuid null` referencing `experiment_runs(id)` with `on delete restrict`.
- Reuse the existing `note` column as the experiment conclusion to avoid a duplicate text field.
- `score numeric(6,2) null`.
- `graded_by uuid null` referencing `profiles(id)`.
- `graded_at timestamptz null`.
- A consistency check requires `score`, `graded_by`, and `graded_at` to be all null or all present.
- Add covering indexes for the new foreign keys.

Update generated TypeScript database types and classroom view models to expose the new fields.

## Database Operations and Authorization

Extend guarded RPCs instead of allowing direct browser writes:

- `create_classroom_assignment` accepts `lab_id` and `max_score`, verifies classroom ownership, and verifies the lab belongs to the classroom.
- `submit_classroom_assignment` accepts `experiment_run_id` and the conclusion, validates membership and ownership, and rejects updates after grading.
- `grade_classroom_assignment_submission` accepts the submission id and score, verifies classroom ownership, reads the authoritative maximum score, and rejects scores outside the allowed range.

All RPCs keep `search_path = ''`, revoke execution from `public` and `anon`, grant only to `authenticated`, and validate `auth.uid()` internally. Existing RLS continues to let students read only their own submissions and classroom owners read submissions in owned rooms.

## UI Structure

Reuse the classroom page, assignment list, dashboard, existing dialog patterns, lab metadata, and experiment-run fields. Add only two focused modal components:

- `ExperimentSubmissionDialog` for selecting a saved run and writing the conclusion.
- `SubmissionReviewDialog` for teacher review and grading.

The visual thesis is a calm classroom workbench: one clear action per assignment, flat sections separated by dividers, no nested card stack, and the existing SciSiam blue reserved for active state and submission actions.

The interaction thesis is restrained: a short modal fade/scale transition, immediate selected-run preview changes, and a status update after successful submission or grading. Reduced-motion users receive an instant transition.

## Error and Empty States

- No saved run: explain that the student must complete and save the assigned lab, with one link to the simulation.
- Missing or removed run: prevent submission and ask the student to choose another eligible run.
- Assignment already graded: show the saved work and grade in read-only mode.
- Score outside range: keep the dialog open and identify the valid range.
- Authorization failure: show a neutral access message without exposing classroom or student details.
- Network failure: retain typed text and selected run so the user can retry.

## Accessibility

- Tabs use `role="tablist"`, `role="tab"`, `aria-selected`, visible focus, and no hidden horizontal interaction.
- Dialogs have labelled titles and descriptions, trap focus, close on Escape, and return focus to the trigger.
- Every score input has an explicit label and visible maximum.
- Experiment graphs and tables include text summaries so the preview is not dependent on color or SVG alone.
- Touch targets are at least 44px and Thai text uses normal tracking with comfortable line height.

## Verification

- Regression tests cover tab layout without horizontal overflow.
- Database tests cover lab/run ownership, classroom ownership, maximum-score bounds, and the graded submission lock.
- UI tests cover student empty, submit, edit, graded, teacher review, and grade states.
- Run `npm test`, `npm run lint`, `npm run build`, secret scan, and `git diff --check`.
- Apply and verify the migration against the linked Supabase project, then run database advisors.
- Browser-check teacher and student accounts at desktop and 390px mobile widths.

## Out of Scope

- Teacher-written feedback, rubrics, grade averages, GPA, rankings, exports, late penalties, and multiple graders.
- Generated experiment screenshots or AI-generated evidence.
- Realtime subscriptions; the dashboard refreshes through the existing load/retry flow.
- Grading general file/link assignments in this iteration.
