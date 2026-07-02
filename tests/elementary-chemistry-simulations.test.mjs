import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const files = [
  "StatesOfMatterSimulation.tsx",
  "MixingAndSeparatingSimulation.tsx",
  "DissolvingSolutionsSimulation.tsx",
];

for (const file of files) {
  test(`${file} has a complete open simulation`, () => {
    const source = readFileSync(
      join(rootDir, "src", "components", "labs", "simulation", file),
      "utf8",
    );

    assert.match(source, /<SharedSimulationShell/);
    assert.match(source, /saveExperimentAndSync/);
    assert.match(source, /aria-labelledby/);
    assert.match(source, /<title id=/);
    assert.match(source, /<desc id=/);
    assert.match(source, /graph=\{/);
    assert.match(source, /table=\{/);
    assert.doesNotMatch(source, /progressValue="0\/1"/);
    assert.doesNotMatch(source, /Math\.random\(\)/);
  });
}
