import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modelPath = path.join(
  root,
  "src/components/labs/simulation/chemistrySceneModels.ts",
);

async function loadModels() {
  assert.ok(existsSync(modelPath), "chemistry scene model module must exist");
  return import(pathToFileURL(modelPath).href);
}

test("galvanic scene strength follows the bridge and remains bounded", async () => {
  const { buildGalvanicSceneModel } = await loadModels();
  const lowBridge = buildGalvanicSceneModel(1, 40);
  const highBridge = buildGalvanicSceneModel(1, 100);
  const lowQ = buildGalvanicSceneModel(0.2, 85);
  const highQ = buildGalvanicSceneModel(3, 85);
  const extreme = buildGalvanicSceneModel(999, -999);

  assert.ok(highBridge.flowStrength > lowBridge.flowStrength);
  assert.ok(highQ.flowStrength <= lowQ.flowStrength);
  assert.ok(extreme.flowStrength >= 0 && extreme.flowStrength <= 1);
  assert.ok(extreme.electronCount >= 3 && extreme.electronCount <= 7);
  assert.ok(extreme.zincIonCount >= 3 && extreme.zincIonCount <= 9);
  assert.ok(extreme.copperIonCount >= 3 && extreme.copperIonCount <= 9);
  assert.ok(extreme.electronDurationMs >= 850 && extreme.electronDurationMs <= 2200);
});

test("reaction-rate scene maps concentration, temperature, and rate to visible motion", async () => {
  const { buildReactionRateSceneModel } = await loadModels();
  const coldDilute = buildReactionRateSceneModel(0.1, 15);
  const hotConcentrated = buildReactionRateSceneModel(2, 70);
  const extreme = buildReactionRateSceneModel(999, -999);

  assert.ok(hotConcentrated.particleCount > coldDilute.particleCount);
  assert.ok(hotConcentrated.speed > coldDilute.speed);
  assert.ok(hotConcentrated.productShare > coldDilute.productShare);
  assert.ok(extreme.particleCount >= 12 && extreme.particleCount <= 42);
  assert.ok(extreme.speed >= 24 && extreme.speed <= 84);
  assert.ok(extreme.productShare >= 0.08 && extreme.productShare <= 0.72);
  assert.ok(extreme.reactionDurationMs >= 2600 && extreme.reactionDurationMs <= 5200);
});

test("solubility scene distinguishes dissolved, near-saturation, and precipitating states", async () => {
  const { buildSolubilitySceneModel } = await loadModels();
  const unsaturated = buildSolubilitySceneModel(0.2, 0);
  const near = buildSolubilitySceneModel(0.9, 0.25);
  const precipitating = buildSolubilitySceneModel(2, 1);
  const extreme = buildSolubilitySceneModel(999, -999);

  assert.equal(unsaturated.state, "unsaturated");
  assert.equal(unsaturated.precipitateCount, 0);
  assert.equal(near.state, "near-saturation");
  assert.equal(precipitating.state, "precipitating");
  assert.ok(precipitating.precipitateCount > 0);
  assert.ok(extreme.dissolvedIonCount >= 4 && extreme.dissolvedIonCount <= 9);
  assert.ok(extreme.commonIonCount >= 2 && extreme.commonIonCount <= 7);
  assert.ok(extreme.precipitateCount >= 0 && extreme.precipitateCount <= 8);
  assert.ok(extreme.mixingStrength >= 0 && extreme.mixingStrength <= 1);
});

test("experiment playback pauses and resumes the same run", async () => {
  const {
    createReadyExperimentPlayback,
    resetExperimentPlayback,
    toggleExperimentPlayback,
  } = await loadModels();

  const ready = createReadyExperimentPlayback();
  const running = toggleExperimentPlayback(ready);
  const paused = toggleExperimentPlayback(running);
  const resumed = toggleExperimentPlayback(paused);

  assert.deepEqual(ready, { isRunning: false, runToken: 0 });
  assert.deepEqual(running, { isRunning: true, runToken: 1 });
  assert.deepEqual(paused, { isRunning: false, runToken: 1 });
  assert.deepEqual(resumed, { isRunning: true, runToken: 1 });
  assert.deepEqual(resetExperimentPlayback(resumed), ready);
});
