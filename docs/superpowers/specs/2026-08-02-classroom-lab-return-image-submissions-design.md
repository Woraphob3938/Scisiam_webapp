# Classroom Lab Return And Image Submissions Design

## Goal

Keep learners inside the classroom flow when they leave a lab, and let a lab submission contain visible image evidence that the classroom owner can review securely.

## Product Decisions

- Audience: students completing classroom lab work and teachers reviewing that work.
- Primary action: a student runs a classroom lab, saves a run, optionally adds real JPG/PNG/WebP images, submits it, and returns to the same classroom's lab menu.
- Tone: preserve SciSiam's calm, technical, Thai-first interface from `DESIGN.md`.
- Preserve the automatic private experiment snapshot. Manual images are optional supporting evidence, not a replacement.

## Navigation Design

Every lab card opened from `LabsPanel` carries the originating `classroom` query parameter. A matching assignment also carries `assignment`; teacher and unassigned entries still carry `classroom` so the route context is not lost.

`SharedSimulationShell` reads the existing `classroom` query parameter. Its “ออกจากแล็บ” link returns to `/classrooms/<classroomId>?tab=labs`; simulations entered outside a classroom continue to return to `/labs`.

## Submission Image Design

`ClassroomLabSubmissionDialog` keeps the selected saved run and its automatic snapshot. It adds an optional multi-image field restricted to JPG, PNG, and WebP. The existing classroom upload pipeline enforces the authoritative limits: no more than 10 files, no more than 10 MB per file, private `classroom-files` storage, and signed URLs.

The student sees image thumbnails before submitting. Existing submitted images remain visible. Editing only the conclusion or selected run preserves existing attachments; choosing new images replaces the previous attachment set through the existing submission update flow.

The teacher review dialog displays a labelled responsive image gallery below the automatic experiment snapshot. Each image uses its signed URL, readable alternative text, contained sizing, and an “เปิดภาพขนาดเต็ม” action. Non-image attachments remain available through the existing attachment links.

## Security And Data

No database migration or new bucket is required. Manual images reuse `classroom-files`, whose upload path is scoped by classroom and user and whose signed URLs are created only after existing classroom access checks. The experiment snapshot continues to use the private `experiment-snapshots` bucket and owner-guarded classroom RPC.

The submission client preserves stored attachments when no replacement files are selected. It removes old files only after a replacement upload and authoritative submission update succeed.

## Responsive And Accessible States

- Controls remain at least 40–44 px high and keep visible focus rings.
- The image picker exposes supported formats and the 10 MB limit in Thai.
- Selected and submitted images use responsive grids with `min-w-0`, contained image sizing, descriptive alternative text, and keyboard-accessible full-size links.
- Loading, empty, invalid-file, submitting, success, and signed-URL-unavailable states keep the current recoverable classroom messaging.

## Verification

- Regression tests cover classroom query preservation and `tab=labs` exit behavior.
- Classroom UI tests cover the image picker, selected preview, teacher gallery, and existing-image preservation.
- Run the focused tests, full tests, lint, build, graph update, Impeccable detector, and responsive browser checks at 320, 375, 414, and 768 px.

