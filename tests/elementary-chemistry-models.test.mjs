import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceDissolution,
  calculateDissolutionRate,
  getMatterPhase,
  getSeparationOutcome,
} from "../src/lib/simulations/elementaryChemistry.ts";

test("water phase uses simplified normal-pressure boundaries", () => {
  assert.equal(getMatterPhase(-1).id, "solid");
  assert.equal(getMatterPhase(0).id, "liquid");
  assert.equal(getMatterPhase(99).id, "liquid");
  assert.equal(getMatterPhase(100).id, "gas");
});

test("preferred separation methods outperform mismatches", () => {
  assert.deepEqual(getSeparationOutcome("iron-sand", "magnet"), {
    isPreferred: true,
    recoveryPercent: 96,
    purityPercent: 95,
  });
  assert.equal(getSeparationOutcome("sand-water", "filtration").purityPercent, 94);
  assert.equal(getSeparationOutcome("salt-water", "evaporation").recoveryPercent, 88);
  assert.equal(getSeparationOutcome("gravel-sand", "sieving").purityPercent, 92);
  assert.ok(
    getSeparationOutcome("iron-sand", "filtration").recoveryPercent < 96,
  );
});

test("warmth and stirring increase dissolution rate", () => {
  const cool = calculateDissolutionRate(20, false, 5);
  const classroomBaseline = calculateDissolutionRate(25, false, 5);
  const warm = calculateDissolutionRate(60, false, 5);
  const stirred = calculateDissolutionRate(60, true, 5);

  assert.ok(warm > cool);
  assert.ok(stirred > warm);
  assert.ok(calculateDissolutionRate(60, true, 10) < stirred);
  assert.ok(5 / classroomBaseline < 30);
});

test("dissolution advance is deterministic and bounded", () => {
  assert.equal(advanceDissolution(0, 2, 0.5), 1);
  assert.equal(advanceDissolution(4.9, 2, 0.5, 5), 5);
  assert.equal(advanceDissolution(5, 2, 0.5, 5), 5);
});
