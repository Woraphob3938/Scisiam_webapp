import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

function readProjectFile(relativePath) {
  return readFileSync(join(rootDir, relativePath), "utf8");
}

test("lab detail page must not fallback unknown lab ids to Newton content", () => {
  const source = readProjectFile("src/app/labs/[id]/page.tsx");

  assert.doesNotMatch(
    source,
    /labsById\[labId\]\s*\|\|\s*labsById\[DEFAULT_LAB_ID\]/
  );
});

test("lab detail data lookup must not fallback unknown lab ids to cooling details", () => {
  const source = readProjectFile("src/data/labDetails.ts");

  assert.doesNotMatch(source, /return\s+labDetails\[labId\]\s*\|\|\s*coolingDetails/);
});

test("simulation route keeps unsupported labs on a placeholder instead of Newton", () => {
  const source = readProjectFile("src/app/labs/[id]/simulation/page.tsx");

  assert.match(source, /return\s+<SimulationPlaceholder labId=\{labId\}\s*\/>/);
  assert.doesNotMatch(source, /return\s+<NewtonsCoolingSimulation\s*\/>;\s*\n\}/);
});

test("mission rewards must not write real score state directly from the page", () => {
  const source = readProjectFile("src/app/missions/page.tsx");

  assert.doesNotMatch(source, /localStorage\.setItem\("scisiam_points"/);
  assert.doesNotMatch(source, /localStorage\.setItem\(`scisiam_claimed_mission_/);
});

const finalBiologySimulationLabs = [
  {
    id: "blood-typing",
    component: "BloodTypingAgglutinationSimulation",
    file: "src/components/labs/simulation/BloodTypingAgglutinationSimulation.tsx",
    title: "Blood Typing & Agglutination",
    saveKey: "scisiam_saved_blood_typing_experiment",
  },
  {
    id: "food-chain",
    component: "FoodChainEcologySimulation",
    file: "src/components/labs/simulation/FoodChainEcologySimulation.tsx",
    title: "Food Chain & Ecology",
    saveKey: "scisiam_saved_food_chain_experiment",
  },
  {
    id: "heart-rate",
    component: "CardiovascularSystemSimulation",
    file: "src/components/labs/simulation/CardiovascularSystemSimulation.tsx",
    title: "Cardiovascular System Lab",
    saveKey: "scisiam_saved_heart_rate_experiment",
  },
];

test("final biology labs are registered as ready direct simulations", () => {
  const registry = readProjectFile("src/data/labSimulationRegistry.ts");

  for (const lab of finalBiologySimulationLabs) {
    assert.match(registry, new RegExp(`"${lab.id}"`), `${lab.id} should be ready`);
  }
});

test("simulation route imports and dispatches the final biology lab components", () => {
  const route = readProjectFile("src/app/labs/[id]/simulation/page.tsx");

  for (const lab of finalBiologySimulationLabs) {
    assert.match(
      route,
      new RegExp(`import ${lab.component} from "@/components/labs/simulation/${lab.component}"`),
      `${lab.component} should be imported`
    );
    assert.match(
      route,
      new RegExp(`"${lab.id}": ${lab.component}`),
      `${lab.id} should dispatch to ${lab.component}`
    );
  }
});

test("final biology lab simulation components exist with save integration", () => {
  for (const lab of finalBiologySimulationLabs) {
    const absolutePath = join(rootDir, lab.file);
    assert.equal(existsSync(absolutePath), true, `${lab.file} should exist`);

    const source = readProjectFile(lab.file);
    assert.match(source, /<SharedSimulationShell/, `${lab.file} should use the shared shell`);
    assert.match(source, new RegExp(`labId=\"${lab.id}\"`), `${lab.file} should set the correct labId`);
    assert.match(source, new RegExp(`localStorageKey: \"${lab.saveKey}\"`), `${lab.file} should persist with its own save key`);
  }
});

test("final biology lab details no longer carry development placeholder labels", () => {
  const details = readProjectFile("src/data/labDetails.ts");

  for (const lab of finalBiologySimulationLabs) {
    const detailBlockPattern = new RegExp(`// \\d+\\. ${lab.title} \\[IN DEVELOPMENT PLACEHOLDER\\]`);
    assert.doesNotMatch(details, detailBlockPattern, `${lab.title} should not be marked as placeholder`);
  }
});
