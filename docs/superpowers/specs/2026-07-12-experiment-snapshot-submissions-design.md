# Experiment Snapshot Submission Design

## Goal

When a signed-in student saves an experiment run, SciSiam should also capture the visible experiment scene as a private image. The same image must appear in the student's classroom submission dialog and the teacher's review dialog. Snapshot failure must never prevent the experiment run itself from being saved.

## User Experience

### Student submission

- Increase the lab-submission dialog from `max-w-3xl` to `max-w-6xl` while retaining a viewport-safe width and height.
- On desktop, show the experiment image and run data in a wider two-column layout. On mobile, stack the image above the data.
- Keep the saved-run selector at the top and show the selected run's image at a useful size rather than a tiny thumbnail.
- Change the conclusion requirement to 5-1,000 characters in the visible helper text, HTML validation, submit-button state, client validation, and database RPC validation.
- If an older run has no image, show a quiet "ไม่มีภาพการทดลองสำหรับรายการนี้" fallback without blocking submission.

### Teacher review

- Increase the teacher review dialog to the same wide layout.
- Reuse the same experiment preview component so students and teachers see the same image and run data.
- Keep the conclusion and grading controls visible beside or below the preview depending on viewport width.
- The image is read-only and cannot alter grading or assignment ownership.

## Capture And Save Flow

1. `saveExperimentAndSync` continues saving the local payload first.
2. `syncExperimentRun` authenticates the user and calls the existing `save_experiment_run` RPC unchanged.
3. After the RPC returns a run ID, the browser locates the experiment scene using `[data-testid="simulation-stage-scene"]`. A conservative fallback may capture the primary simulation SVG or main experiment region for legacy simulations.
4. A browser-only capture helper converts the region to WebP at approximately 85% quality, limits output width to 1,920 px, and rejects oversized results.
5. The image uploads to the private `experiment-snapshots` bucket at `<user-id>/<run-id>.webp`.
6. A new `attach_experiment_run_snapshot(run_id, snapshot_path)` RPC validates that the caller owns the run and that the path begins with the caller's user ID before writing `experiment_runs.snapshot_path`.
7. If capture, upload, or attachment fails, the helper removes any staged file when possible and still returns the successful experiment run result.

This ordering guarantees that image work is optional and cannot roll back a valid experiment record.

## Database And Storage

Create one forward migration that:

- Adds nullable `snapshot_path text` to `public.experiment_runs`, bounded in length and constrained to a safe relative storage path.
- Creates private bucket `experiment-snapshots` with WebP-only MIME type and a 3 MB file limit.
- Adds owner insert/select/delete policies based on the first path segment matching `auth.uid()`.
- Adds teacher read access only when the object is linked to an experiment run submitted in a classroom owned by that teacher.
- Adds the guarded `attach_experiment_run_snapshot` RPC.
- Extends `get_classroom_submission_experiment_run` to return `snapshot_path` after its existing classroom-owner authorization check.
- Replaces the current guarded classroom submission RPC with identical behavior except that lab conclusions accept 5-1,000 characters instead of 20-1,000.

Only storage paths are stored in the database. Public URLs and base64 image data are forbidden.

## Client Data Flow

- Extend generated/manual database types with `snapshot_path` and the new RPC.
- Extend `ClassroomExperimentRun` with `snapshot_path` and a client-only `snapshotUrl` field.
- `listMyExperimentRunsForLab` selects the path and creates a short-lived signed URL for the owning student.
- `getClassroomSubmissionExperimentRun` receives the path from the guarded RPC and creates a short-lived signed URL for the authorized teacher.
- `ExperimentRunPreview` renders the signed image with an accessible Thai alt description and a no-image fallback.

## Failure Handling

- Missing capture target: save run normally, no snapshot.
- Canvas or font/image serialization error: save run normally, no snapshot.
- Storage upload error: save run normally, no snapshot.
- Snapshot attachment RPC error: attempt to delete the staged object, then keep the run successful.
- Signed URL error: render the no-image fallback; do not block submission or grading.
- Existing runs remain valid because `snapshot_path` is nullable.

## Security

- The bucket remains private.
- The client cannot attach a snapshot to another user's run.
- A teacher can read a snapshot only through an owned classroom submission relationship.
- Snapshot paths, not signed URLs, are persisted.
- Snapshot capture excludes navigation, account details, AI chat, and classroom UI by targeting only the experiment scene.

## Testing

- Regression test the 5-1,000 UI and SQL limits.
- Test that the snapshot RPC checks run ownership and path ownership.
- Test private bucket MIME/size limits and student/teacher read policies.
- Test that snapshot failure leaves `saveExperimentAndSync` successful.
- Test student and teacher dialogs share the image preview and wide responsive layout.
- Run `npm test`, `npm run lint`, `npm run build`, `supabase db lint --linked`, secret scan, and desktop/mobile browser QA.

## Out Of Scope

- Capturing video or animation.
- Editing or annotating snapshots.
- Generating images for unsigned/offline-only runs.
- Backfilling images for historical runs.
