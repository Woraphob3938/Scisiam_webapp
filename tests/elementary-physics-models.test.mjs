import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateBuoyancy,
  calculateMagneticInteraction,
  calculateSimpleCircuit,
  isMagneticallyAttracted,
} from "../src/lib/simulations/elementaryPhysics.ts";

test("elementary circuit needs a closed path", () => {
  assert.equal(calculateSimpleCircuit(1, false, true).currentAmp, 0);
  assert.equal(calculateSimpleCircuit(1, true, false).currentAmp, 0);
  assert.equal(calculateSimpleCircuit(1, true, true).currentAmp, 0.25);
  assert.equal(calculateSimpleCircuit(2, true, true).currentAmp, 0.5);
});

test("buoyancy compares weight with displaced water", () => {
  assert.equal(calculateBuoyancy(0.05, 0.0001).outcome, "float");
  assert.equal(calculateBuoyancy(0.2, 0.00005).outcome, "sink");
});

test("magnet poles and materials follow elementary rules", () => {
  assert.equal(calculateMagneticInteraction("N", "S", 10).relation, "attract");
  assert.equal(calculateMagneticInteraction("N", "N", 10).relation, "repel");
  assert.ok(
    calculateMagneticInteraction("N", "S", 5).strength >
      calculateMagneticInteraction("N", "S", 20).strength,
  );
  assert.equal(isMagneticallyAttracted("iron"), true);
  assert.equal(isMagneticallyAttracted("aluminum"), false);
});
