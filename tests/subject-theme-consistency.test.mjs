import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("lab hero theme follows the metadata category instead of a lab-id exception", () => {
  const hero = readProjectFile("src/components/labs/LabHero.tsx");

  assert.match(hero, /const isBiology = category === "Biology";/);
  assert.match(hero, /const chemistryTone = category === "Chemistry";/);
});

test("shared simulations resolve Physics, Chemistry, and Biology accents from their category", () => {
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");

  assert.match(shell, /Physics: "blue"/);
  assert.match(shell, /Chemistry: "violet"/);
  assert.match(shell, /Biology: "emerald"/);
  assert.match(shell, /const resolvedAccent = categoryAccents\[category\] \?\? accent;/);
});
