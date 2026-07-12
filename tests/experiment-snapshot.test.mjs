import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const helperPath = path.join(root, "src", "lib", "experiment-snapshot.ts");

test("experiment snapshots capture the stage as bounded WebP", () => {
  assert.equal(existsSync(helperPath), true, "expected an experiment snapshot helper");
  const source = readFileSync(helperPath, "utf8");

  assert.match(source, /simulation-stage-scene/);
  assert.match(source, /toCanvas/);
  assert.match(source, /skipFonts: true/);
  assert.match(source, /image\/webp/);
  assert.match(source, /0\.85/);
  assert.match(source, /MAX_SNAPSHOT_WIDTH = 1920/);
  assert.match(source, /MAX_SNAPSHOT_BYTES = 3 \* 1024 \* 1024/);
  assert.match(source, /experiment-snapshots/);
  assert.match(source, /upsert: false/);
});

test("snapshot attachment is best-effort after the authoritative run save", () => {
  const source = readFileSync(
    path.join(root, "src", "lib", "supabase", "experiment-sync.ts"),
    "utf8",
  );
  const saveIndex = source.indexOf('rpc("save_experiment_run"');
  const captureIndex = source.indexOf("await captureExperimentSnapshot()");

  assert.ok(saveIndex >= 0);
  assert.ok(captureIndex > saveIndex, "capture must happen after save_experiment_run");
  assert.match(source, /rpc\("attach_experiment_run_snapshot"/);
  assert.match(source, /catch\s*\{/);
  assert.match(source, /return \{ ok: true, runId: data \}/);
});
