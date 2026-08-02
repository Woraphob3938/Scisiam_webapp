# Classroom Lab Return And Image Submissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Return classroom-launched simulations to the current classroom lab tab and support secure, visible student image evidence in lab submissions.

**Architecture:** Preserve classroom context through the existing simulation query string and reuse the existing private classroom attachment pipeline for manual images. Keep automatic experiment snapshots unchanged, preserve stored attachments on metadata-only resubmission, and render signed image URLs in the teacher review dialog.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Supabase Database/Storage, Node test runner.

## Global Constraints

- Preserve `DESIGN.md`: Thai-first Noto Sans Thai/Inter, restrained blue/slate surfaces, existing focus and spacing patterns.
- Accept only `image/jpeg`, `image/png`, and `image/webp` in the lab image picker.
- Keep the existing server-side classroom file limit of 10 files and 10 MB per file.
- Do not add a dependency, database migration, storage bucket, or public image URL.
- Do not modify unrelated dirty chemistry simulation files.
- Do not commit or push unless the user asks.

---

### Task 1: Lock Classroom Return Navigation With Regression Tests

**Files:**
- Modify: `tests/classroom-workspace-ui.test.mjs`
- Modify: `tests/mathematics-theme-ui.test.mjs`
- Modify: `tests/newtons-cooling-controls.test.mjs`
- Modify: `src/app/classrooms/[id]/page.tsx`
- Modify: `src/components/labs/simulation/SharedSimulationShell.tsx`

**Interfaces:**
- Consumes: `classroom` and optional `assignment` search parameters.
- Produces: classroom lab links that always contain `classroom`; `exitHref` ending in `?tab=labs` for classroom-launched simulations.

- [ ] **Step 1: Write failing navigation assertions**

```js
assert.match(source, /const classroomLabHref = `\/labs\/\$\{lab\.id\}\/simulation\?classroom=\$\{encodeURIComponent\(classroomId\)\}`/);
assert.match(source, /: classroomLabHref/);
assert.match(shell, /searchParams\.get\("classroom"\)[\s\S]*?tab=labs/);
assert.doesNotMatch(shell, /tab=classwork/);
```

- [ ] **Step 2: Run the focused tests and confirm the old behavior fails**

Run: `rtk node --test tests/classroom-workspace-ui.test.mjs tests/mathematics-theme-ui.test.mjs tests/newtons-cooling-controls.test.mjs`

Expected: FAIL because unassigned classroom labs drop `classroom` and the shared exit uses `tab=classwork`.

- [ ] **Step 3: Preserve the classroom query and return to the labs tab**

```tsx
const classroomLabHref = `/labs/${lab.id}/simulation?classroom=${encodeURIComponent(classroomId)}`;
const labHref = labAssignment
  ? `${classroomLabHref}&assignment=${encodeURIComponent(labAssignment.id)}`
  : classroomLabHref;
```

```tsx
const exitHref = classroomId
  ? `/classrooms/${encodeURIComponent(classroomId)}?tab=labs`
  : "/labs";
```

- [ ] **Step 4: Re-run the focused tests**

Run: `rtk node --test tests/classroom-workspace-ui.test.mjs tests/mathematics-theme-ui.test.mjs tests/newtons-cooling-controls.test.mjs`

Expected: PASS.

### Task 2: Preserve Existing Attachments During Metadata-Only Resubmission

**Files:**
- Modify: `tests/classrooms.test.mjs`
- Modify: `src/lib/supabase/classrooms.ts`

**Interfaces:**
- Consumes: stored submission `attachments` JSON and legacy attachment columns.
- Produces: `nextAttachments`, reusing stored attachments when `input.attachmentFiles` is empty and replacing them only after a new upload succeeds.

- [ ] **Step 1: Write a failing source regression test**

```js
assert.match(source, /const existingAttachments = existingSubmission[\s\S]*normalizeStoredAttachments/);
assert.match(source, /const nextAttachments = uploaded\.length > 0 \? uploaded : existingAttachments/);
assert.match(source, /p_attachments: nextAttachments\.map\(toAttachmentJson\)/);
assert.match(source, /if \(existingSubmission && uploaded\.length > 0\)/);
```

- [ ] **Step 2: Run the classroom regression test and confirm failure**

Run: `rtk node --test tests/classrooms.test.mjs`

Expected: FAIL because an empty replacement currently clears and deletes stored attachments.

- [ ] **Step 3: Preserve or replace attachments atomically**

```ts
const existingAttachments = existingSubmission
  ? normalizeStoredAttachments(existingSubmission.attachments)
  : [];
const uploaded = await uploadClassroomFiles(supabase, classroomId, userId, input.attachmentFiles);
const nextAttachments = uploaded.length > 0 ? uploaded : existingAttachments;

// RPC input
p_attachments: nextAttachments.map(toAttachmentJson),

if (existingSubmission && uploaded.length > 0) {
  await removeClassroomFiles(supabase, attachmentPaths(existingSubmission.attachments, existingSubmission));
}
```

Keep the existing legacy-column fallback when normalizing older submissions.

- [ ] **Step 4: Re-run the classroom regression test**

Run: `rtk node --test tests/classrooms.test.mjs`

Expected: PASS.

### Task 3: Add Student Image Selection And Teacher Image Review

**Files:**
- Modify: `tests/classroom-workspace-ui.test.mjs`
- Modify: `src/components/classrooms/ClassroomLabSubmissionDialog.tsx`
- Modify: `src/app/classrooms/[id]/page.tsx`

**Interfaces:**
- Consumes: `ClassroomFileAttachment[]`, selected `File[]`, and existing `SubmitClassroomAssignmentInput.attachmentFiles`.
- Produces: exported `ClassroomSubmissionImageGallery`, optional image picker, local selected-image preview, and teacher review gallery.

- [ ] **Step 1: Write failing UI regression assertions**

```js
assert.match(labSubmissionDialogSource, /accept="image\/jpeg,image\/png,image\/webp"/);
assert.match(labSubmissionDialogSource, /attachmentFiles: imageFiles/);
assert.match(labSubmissionDialogSource, /ClassroomSubmissionImageGallery/);
assert.match(source, /รูปภาพผลการทดลองที่นักเรียนแนบ/);
assert.match(source, /reviewing\.attachments/);
```

- [ ] **Step 2: Run the focused classroom UI test and confirm failure**

Run: `rtk node --test tests/classroom-workspace-ui.test.mjs`

Expected: FAIL because the lab dialog currently sends an empty attachment list and teacher review only shows the automatic snapshot.

- [ ] **Step 3: Add bounded image selection and selected previews**

```tsx
const [imageFiles, setImageFiles] = useState<File[]>([]);

<input
  type="file"
  accept="image/jpeg,image/png,image/webp"
  multiple
  onChange={(event) => selectSubmissionImages(Array.from(event.target.files ?? []))}
/>
```

Reject unsupported MIME types, empty images, files over 10 MB, and a merged selection over 10 files with specific Thai toast messages. Render each accepted local file through a child preview that creates one object URL and revokes it on unmount.

- [ ] **Step 4: Submit selected images and render stored images**

```tsx
attachmentFiles: imageFiles,
```

Export a gallery that filters signed attachments to image MIME types or image extensions and renders a responsive `next/image` thumbnail plus a keyboard-accessible full-size link.

- [ ] **Step 5: Place the gallery in teacher review**

```tsx
<ClassroomSubmissionImageGallery
  attachments={reviewing.attachments}
  heading="รูปภาพผลการทดลองที่นักเรียนแนบ"
/>
```

Keep `ExperimentRunPreview` immediately before it so the teacher sees the automatic snapshot and the student's supporting images as separate evidence.

- [ ] **Step 6: Re-run the focused classroom UI test**

Run: `rtk node --test tests/classroom-workspace-ui.test.mjs`

Expected: PASS.

### Task 4: Verify The Complete Flow

**Files:**
- Modify: none unless verification exposes an in-scope defect.

**Interfaces:**
- Consumes: all changes from Tasks 1–3.
- Produces: verified classroom navigation, student upload states, and teacher image rendering.

- [ ] **Step 1: Run all focused classroom and snapshot tests**

Run: `rtk node --test tests/classroom-workspace-ui.test.mjs tests/classrooms.test.mjs tests/experiment-snapshot.test.mjs tests/mathematics-theme-ui.test.mjs tests/newtons-cooling-controls.test.mjs tests/security-hardening.test.mjs tests/security-remediation.test.mjs`

Expected: PASS with zero failed tests.

- [ ] **Step 2: Run the complete quality gates**

Run: `rtk npm test`

Run: `rtk npm run lint`

Run: `rtk npm run build`

Expected: all commands exit 0; pre-existing warnings in unrelated dirty chemistry files are reported separately.

- [ ] **Step 3: Refresh the repository graph**

Run: `rtk graphify update .`

Expected: graph update exits 0 without changing production behavior.

- [ ] **Step 4: Run the Impeccable detector once**

Run: `rtk node C:\Users\HP\.agents\skills\impeccable\scripts\detect.mjs --json "src/app/classrooms/[id]/page.tsx" "src/components/classrooms/ClassroomLabSubmissionDialog.tsx" "src/components/labs/simulation/SharedSimulationShell.tsx"`

Expected: no blocking detector findings; fix any in-scope finding and rerun only the relevant functional checks.

- [ ] **Step 5: Verify responsive behavior**

Open a classroom lab and the submission/review dialogs at 320, 375, 414, and 768 px. Confirm no horizontal overflow, the image grid collapses to one column on narrow screens, Thai labels remain readable, focus is visible, and “ออกจากแล็บ” returns to the same classroom's `labs` tab.

