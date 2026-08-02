import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const readSimulation = (file) =>
  readFileSync(
    join(rootDir, "src", "components", "labs", "simulation", file),
    "utf8",
  );

test("redesigned chemistry scenes are distinct and accessible", () => {
  const equilibrium = readSimulation("LeChateliersPrincipleSimulation.tsx");
  const spectrophotometry = readSimulation("BeerLambertLawSimulation.tsx");
  const calorimetry = readSimulation("HesssLawSimulation.tsx");

  assert.match(equilibrium, /data-testid="chemical-equilibrium-scene"/);
  assert.match(spectrophotometry, /data-testid="spectrophotometry-scene"/);
  assert.match(calorimetry, /data-testid="hess-calorimeter-scene"/);

  for (const source of [equilibrium, spectrophotometry, calorimetry]) {
    assert.match(source, /aria-labelledby/);
    assert.match(source, /<title id=/);
    assert.match(source, /<desc id=/);
  }
});

test("experiment buttons drive visible measurements instead of only timers", () => {
  const equilibrium = readSimulation("LeChateliersPrincipleSimulation.tsx");
  const spectrophotometry = readSimulation("BeerLambertLawSimulation.tsx");
  const calorimetry = readSimulation("HesssLawSimulation.tsx");

  assert.match(equilibrium, /reactionProgress/);
  assert.match(equilibrium, /setReactionProgress/);
  assert.match(spectrophotometry, /scanProgress/);
  assert.match(spectrophotometry, /measuredAbsorbance/);
  assert.match(calorimetry, /computeTempAtTime/);
  assert.match(calorimetry, /livePointsRef/);
});

test("redesigned chemistry labs keep their dedicated simulation routes", () => {
  const route = readFileSync(
    join(rootDir, "src", "app", "labs", "[id]", "simulation", "page.tsx"),
    "utf8",
  );

  assert.match(
    route,
    /"le-chateliers-principle": LeChateliersPrincipleSimulation/,
  );
  assert.match(route, /"beer-lambert-law": BeerLambertLawSimulation/);
  assert.match(route, /"hesss-law": HesssLawSimulation/);
});
