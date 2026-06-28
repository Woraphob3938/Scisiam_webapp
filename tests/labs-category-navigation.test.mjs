import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (path) => readFileSync(join(rootDir, path), "utf8");

test("simulation category breadcrumb opens labs with the requested category", () => {
  const shell = readProjectFile("src/components/labs/simulation/SharedSimulationShell.tsx");
  const labsPage = readProjectFile("src/app/labs/page.tsx");

  assert.match(
    shell,
    /href=\{`\/labs\?category=\$\{encodeURIComponent\(category\)\}`\}/,
  );
  assert.match(labsPage, /const requestedCategory = getRequestedCategory\(searchParams\)/);
  assert.match(
    labsPage,
    /\(\) => requestedCategory \?\? restoredState\?\.selectedCategory \?\? "All"/,
  );
  assert.match(
    labsPage,
    /\(\) => requestedCategory \? "All" : restoredState\?\.selectedGradeLevel \?\? "All"/,
  );
  assert.match(
    labsPage,
    /\(\) => requestedCategory \? "" : restoredState\?\.searchQuery \?\? ""/,
  );
});

test("legacy simulation breadcrumbs do not route category links to the home page", () => {
  const simulationDir = join(rootDir, "src/components/labs/simulation");

  for (const file of readdirSync(simulationDir).filter((name) => name.endsWith(".tsx"))) {
    const source = readFileSync(join(simulationDir, file), "utf8");
    assert.doesNotMatch(source, /href=(?:"|\{`)\/\?category=/, file);
  }
});
