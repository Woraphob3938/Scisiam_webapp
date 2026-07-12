import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => readFileSync(path.join(root, file), "utf8");
const migrationSource = () =>
  readdirSync(path.join(root, "supabase", "migrations"))
    .filter((file) => file.endsWith(".sql"))
    .map((file) => read(path.join("supabase", "migrations", file)))
    .join("\n");

test("classroom storage protects student submissions and bounds unlinked uploads", () => {
  const source = migrationSource();

  assert.match(source, /private\.can_read_classroom_file\(name\)/);
  assert.match(source, /private\.can_upload_classroom_file\(name\)/);
  assert.match(source, /private\.can_delete_classroom_file\(name\)/);
  assert.match(source, /for delete\s+to authenticated\s+using\s*\(\s*bucket_id = 'classroom-files'/);
  assert.match(
    source,
    /update storage\.buckets\s+set[\s\S]{0,240}allowed_mime_types = array\[[\s\S]{0,1200}where id = 'classroom-files'/,
  );
});

test("experiment snapshots use a private bounded bucket with guarded reads", () => {
  const source = migrationSource();

  assert.match(source, /'experiment-snapshots'[\s\S]{0,160}false[\s\S]{0,80}3145728/i);
  assert.match(source, /bucket_id = 'experiment-snapshots'[\s\S]+\(storage\.foldername\(name\)\)\[1\] = \(select auth\.uid\(\)\)::text/i);
  assert.match(source, /create or replace function private\.can_read_experiment_snapshot/i);
  assert.match(source, /private\.is_class_creator\(submissions\.classroom_id\)/i);
  assert.match(source, /revoke all on function public\.attach_experiment_run_snapshot/i);
  assert.match(source, /grant execute on function public\.attach_experiment_run_snapshot[\s\S]*to authenticated/i);
  assert.match(source, /split_part\(split_part\(p_snapshot_path, '\/', 2\), '\.', 1\) <> p_run_id::text/i);
  assert.match(source, /from storage\.objects as objects[\s\S]+objects\.bucket_id = 'experiment-snapshots'[\s\S]+objects\.name = p_snapshot_path/i);
});

test("classroom client validates supported files and does not hide failed cleanup", () => {
  const source = read("src/lib/supabase/classrooms.ts");

  assert.match(source, /const CLASSROOM_FILE_MIME_TYPES/);
  assert.match(source, /!CLASSROOM_FILE_MIME_TYPES\.has\(file\.type\)/);
  assert.doesNotMatch(source, /\.remove\(paths\)\.catch\(\(\) => null\)/);
});

test("OAuth callback accepts only same-origin relative destinations", () => {
  const source = read("src/app/auth/oauth-callback/route.ts");

  assert.match(source, /function getSafeRedirectPath/);
  assert.match(source, /destination\.origin === base\.origin/);
  assert.match(source, /requestedNext\.includes\("\\\\"\)/);
});

test("AI rate limiting uses the verified account and streams a bounded request body", () => {
  const source = read("src/app/api/ai-tutor/route.ts");

  assert.match(source, /function getRateLimitKey\(request: NextRequest, context: UsageContext\)/);
  assert.match(source, /context\.userId \? `user:\$\{context\.userId\}`/);
  assert.match(source, /request\.body\?\.getReader\(\)/);
  assert.match(source, /totalBytes > MAX_REQUEST_BYTES/);
});

test("production CSP is enforced and excludes direct Gemini browser access", () => {
  const source = read("next.config.ts");

  assert.match(source, /key: "Content-Security-Policy"/);
  assert.doesNotMatch(source, /Content-Security-Policy-Report-Only/);
  assert.doesNotMatch(source, /generativelanguage\.googleapis\.com/);
});
